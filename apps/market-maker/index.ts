import "dotenv/config";
import { RedisPubSubClient, RedisQueueClient } from "@corvian/common";

type BookLevel = { price: number; quantity?: number; amount?: number };
type MarketBook = { bids: BookLevel[]; asks: BookLevel[]; bidOrderCount?: number; askOrderCount?: number };
type MarketConfig = { symbol: string; referencePrice: number; tickSize: number };

const queueUrl = process.env.REDIS_SERVERA || "redis://localhost:6379";
const marketDataUrl = process.env.REDIS_SERVERB || "redis://localhost:6380";
const targetOrdersPerSide = Math.max(1, Number(process.env.MARKET_MAKER_ORDERS_PER_SIDE || 10_000));
const targetSideQuantity = Number(process.env.MARKET_MAKER_SIDE_QUANTITY || 1);
const minimumSpreadTicks = Math.max(1, Number(process.env.MARKET_MAKER_MIN_SPREAD_TICKS || 1));
const quoteScaleBps = Math.max(0.1, Number(process.env.MARKET_MAKER_QUOTE_SCALE_BPS || 10));
const minimumOrderNotional = Math.max(1, Number(process.env.MARKET_MAKER_MIN_ORDER_NOTIONAL || 100));
const maximumOrderNotional = Math.max(minimumOrderNotional, Number(process.env.MARKET_MAKER_MAX_ORDER_NOTIONAL || 2_000));
const minimumTradeNotional = Math.max(1, Number(process.env.MARKET_MAKER_MIN_TRADE_NOTIONAL || 5_000));
const maximumTradeNotional = Math.max(minimumTradeNotional, Number(process.env.MARKET_MAKER_MAX_TRADE_NOTIONAL || 30_000));
const repriceIntervalMs = Math.max(1_000, Number(process.env.MARKET_MAKER_REPRICE_INTERVAL_MS || 10_000));
const repriceFraction = Math.min(0.1, Math.max(0.001, Number(process.env.MARKET_MAKER_REPRICE_FRACTION || 0.01)));
const tradeIntervalMs = Number(process.env.MARKET_MAKER_TRADE_INTERVAL_MS || 250);
const symbols: MarketConfig[] = (process.env.MARKET_MAKER_SYMBOLS || "BTCUSDT:67000:0.1,ETHUSDT:2470:0.01,SOLUSDT:162:0.01")
  .split(",")
  .map((entry) => {
    const [symbol, referencePrice, tickSize] = entry.trim().split(":");
    return {
      symbol: symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      referencePrice: Number(referencePrice),
      tickSize: Number(tickSize),
    };
  })
  .filter((market) => market.symbol && market.referencePrice > 0 && market.tickSize > 0);

const queue = RedisQueueClient.getInstance(queueUrl);
const marketData = RedisPubSubClient.getInstance(marketDataUrl);
const state = new Map<string, { book: MarketBook; price: number; refilling: boolean; repricing: boolean; depthVersion: number; fairPriceInitialized: boolean; quoteOrderIds: Array<{ orderID: string; side: "BUY" | "SELL" }>; nextTakerSide: "BUY" | "SELL" }>();
let orderSequence = 0;

function parseMessage<T>(rawMessage: string): T | undefined {
  try {
    return JSON.parse(rawMessage) as T;
  } catch (error) {
    console.error("Market maker received invalid market data", error);
    return undefined;
  }
}

function quantity(level: BookLevel) {
  return Number(level.quantity ?? level.amount ?? 0);
}

function decimalPlaces(value: number) {
  const decimals = value.toString().split(".")[1];
  return decimals?.length ?? 0;
}

function roundToTick(value: number, tickSize: number) {
  const rounded = Math.round(value / tickSize) * tickSize;
  return Number(rounded.toFixed(decimalPlaces(tickSize)));
}

function sideNeedsQuotes(levels: BookLevel[], orderCount?: number) {
  const visibleQuantity = levels.reduce((sum, level) => sum + quantity(level), 0);
  return (orderCount ?? levels.length) < targetOrdersPerSide || visibleQuantity < targetSideQuantity;
}

function quoteCount(levels: BookLevel[], orderCount?: number) {
  return Math.max(0, targetOrdersPerSide - (orderCount ?? levels.length));
}

function createQuoteOrders(config: MarketConfig, market: { book: MarketBook; price: number }, bidCount: number, askCount: number) {
  const { bids, asks } = market.book;
  const center = market.price || config.referencePrice;
  const bestBid = bids.length ? Number(bids[0].price) : Number.NEGATIVE_INFINITY;
  const bestAsk = asks.length ? Number(asks[0].price) : Number.POSITIVE_INFINITY;
  // Geometric tick distances create a dense touch and a long, thinning tail.
  // There is no fixed outer price band; occasional quotes can sit far away.
  const distanceInTicks = () => minimumSpreadTicks + Math.floor(
    -Math.log(Math.max(Number.EPSILON, 1 - Math.random())) * Math.max(2, center * quoteScaleBps / 10_000 / config.tickSize),
  );
  const randomOrderQuantity = (price: number) => {
    const notional = minimumOrderNotional + Math.random() * (maximumOrderNotional - minimumOrderNotional);
    return (notional / price).toFixed(8);
  };
  const orders: Array<Record<string, string>> = [];

  for (let level = 0; level < bidCount; level += 1) {
    const desiredPrice = center - distanceInTicks() * config.tickSize;
    const nonCrossingPrice = Number.isFinite(bestAsk) ? Math.min(desiredPrice, bestAsk - config.tickSize) : desiredPrice;
    const price = Math.max(config.tickSize, roundToTick(nonCrossingPrice, config.tickSize));
    orders.push({
      orderID: `mm-${config.symbol}-${Date.now()}-${++orderSequence}`,
      symbol: config.symbol,
      side: "BUY",
      type: "LIMIT",
      price: String(price),
      quantity: randomOrderQuantity(price),
    });
  }

  for (let level = 0; level < askCount; level += 1) {
    const desiredPrice = center + distanceInTicks() * config.tickSize;
    const nonCrossingPrice = Number.isFinite(bestBid) ? Math.max(desiredPrice, bestBid + config.tickSize) : desiredPrice;
    const price = roundToTick(nonCrossingPrice, config.tickSize);
    orders.push({
      orderID: `mm-${config.symbol}-${Date.now()}-${++orderSequence}`,
      symbol: config.symbol,
      side: "SELL",
      type: "LIMIT",
      price: String(price),
      quantity: randomOrderQuantity(price),
    });
  }

  return orders;
}

async function addQuotes(config: MarketConfig) {
  const market = state.get(config.symbol);
  if (!market || market.refilling) return;

  const { bids, asks } = market.book;
  const addBids = sideNeedsQuotes(bids, market.book.bidOrderCount);
  const addAsks = sideNeedsQuotes(asks, market.book.askOrderCount);
  if (!addBids && !addAsks) return;

  market.refilling = true;
  const startingDepthVersion = market.depthVersion;
  const orders = createQuoteOrders(
    config,
    market,
    addBids ? quoteCount(bids, market.book.bidOrderCount) : 0,
    addAsks ? quoteCount(asks, market.book.askOrderCount) : 0,
  );

  try {
    if (orders.length) {
      await queue.sendDataToQueue({ action: "batch", orders });
      for (const order of orders) {
        market.quoteOrderIds.push({ orderID: order.orderID, side: order.side as "BUY" | "SELL" });
      }
      console.info(`Market maker queued ${orders.length} quotes for ${config.symbol}`);
    }
  } catch (error) {
    console.error(`Market maker could not queue quotes for ${config.symbol}`, error);
  } finally {
    // Recheck only after the engine has published a newer depth snapshot.
    setTimeout(() => {
      market.refilling = false;
      if (market.depthVersion > startingDepthVersion) void addQuotes(config);
    }, 3000);
  }
}

async function repriceQuotes(config: MarketConfig) {
  const market = state.get(config.symbol);
  if (!market || market.refilling || market.repricing) return;

  const bidCount = Math.max(1, Math.floor(targetOrdersPerSide * repriceFraction));
  const askCount = bidCount;
  const bids: string[] = [];
  const asks: string[] = [];
  for (let index = market.quoteOrderIds.length - 1; index >= 0 && (bids.length < bidCount || asks.length < askCount); index -= 1) {
    const quote = market.quoteOrderIds[index];
    const bucket = quote.side === "BUY" ? bids : asks;
    const limit = quote.side === "BUY" ? bidCount : askCount;
    if (bucket.length >= limit) continue;
    bucket.push(quote.orderID);
    market.quoteOrderIds.splice(index, 1);
  }
  if (!bids.length && !asks.length) return;

  market.repricing = true;
  const startingDepthVersion = market.depthVersion;
  try {
    await queue.sendDataToQueue({
      action: "cancelBatch",
      symbol: config.symbol,
      orderIDs: [...bids, ...asks],
    });
    console.info(`Market maker repricing ${bids.length} bids and ${asks.length} asks for ${config.symbol}`);
  } catch (error) {
    console.error(`Market maker could not reprice quotes for ${config.symbol}`, error);
    for (const orderID of bids) market.quoteOrderIds.push({ orderID, side: "BUY" });
    for (const orderID of asks) market.quoteOrderIds.push({ orderID, side: "SELL" });
  } finally {
    setTimeout(() => {
      market.repricing = false;
      if (market.depthVersion > startingDepthVersion) void addQuotes(config);
    }, 3_000);
  }
}

async function simulateTrade(config: MarketConfig) {
  const market = state.get(config.symbol);
  if (!market?.book.bids.length || !market.book.asks.length) return;

  if (Math.random() > 0.6) market.nextTakerSide = market.nextTakerSide === "BUY" ? "SELL" : "BUY";
  const side = market.nextTakerSide;
  const bestOpposite = side === "BUY" ? market.book.asks[0] : market.book.bids[0];
  const price = Number(bestOpposite.price) + (side === "BUY" ? config.tickSize : -config.tickSize);
  if (!Number.isFinite(price) || price <= 0) return;

  const order = {
    orderID: `mm-taker-${config.symbol}-${Date.now()}-${++orderSequence}`,
    symbol: config.symbol,
    side,
    type: "MARKET",
    price: String(roundToTick(price, config.tickSize)),
    quantity: ((minimumTradeNotional + Math.random() * (maximumTradeNotional - minimumTradeNotional)) / Number(bestOpposite.price)).toFixed(8),
    kind: "ioc",
  };

  try {
    await queue.sendDataToQueue(order);
  } catch (error) {
    console.error(`Market maker could not queue a simulated ${side.toLowerCase()} trade for ${config.symbol}`, error);
  }
}

async function start() {
  if (!symbols.length) throw new Error("No valid markets configured in MARKET_MAKER_SYMBOLS.");

  await queue.connectToClient();
  await marketData.connectToClient();

  for (const config of symbols) {
    state.set(config.symbol, {
      book: { bids: [], asks: [] },
      price: config.referencePrice,
      refilling: false,
      repricing: false,
      depthVersion: 0,
      fairPriceInitialized: false,
      quoteOrderIds: [],
      nextTakerSide: Math.random() < 0.5 ? "BUY" : "SELL",
    });

    await marketData.subscribeToBroker(`depth:${config.symbol}`, (message) => {
      const snapshot = parseMessage<MarketBook>(message);
      const market = state.get(config.symbol);
      if (!snapshot || !market) return;
      market.book = { bids: snapshot.bids ?? [], asks: snapshot.asks ?? [] };
      market.book.bidOrderCount = snapshot.bidOrderCount;
      market.book.askOrderCount = snapshot.askOrderCount;
      if (!market.fairPriceInitialized && market.book.bids.length && market.book.asks.length) {
        const bestBid = Number(market.book.bids[0].price);
        const bestAsk = Number(market.book.asks[0].price);
        if (Number.isFinite(bestBid) && Number.isFinite(bestAsk) && bestBid <= bestAsk) {
          market.price = (bestBid + bestAsk) / 2;
          market.fairPriceInitialized = true;
        }
      }
      market.depthVersion += 1;
      void addQuotes(config);
    });

    await marketData.subscribeToBroker(`ticker:${config.symbol}`, (message) => {
      const ticker = parseMessage<{ price?: number }>(message);
      const market = state.get(config.symbol);
      if (ticker?.price && Number.isFinite(ticker.price) && market) market.price = ticker.price;
    });

    await marketData.publishToBroker("snapshot:REQUEST", JSON.stringify({ topic: `depth:${config.symbol}` }));
    // Seed configured liquidity immediately; the depth snapshot will refine it once it arrives.
    void addQuotes(config);
    setInterval(() => void repriceQuotes(config), repriceIntervalMs);
    if (tradeIntervalMs > 0) setInterval(() => void simulateTrade(config), tradeIntervalMs);
  }

  console.info(`Market maker is running for ${symbols.map(({ symbol }) => symbol).join(", ")}`);
}

void start().catch((error) => {
  console.error("Market maker failed to start", error);
  process.exitCode = 1;
});
