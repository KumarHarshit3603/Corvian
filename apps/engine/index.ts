import { connectToQueue, sendOrderStatus } from "./getOrders";
import { connectToWS, publishMarketData } from "./ws";
import { getOrderbook, type fill, type orderbook, type responseObject } from "./orderbook";

type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

const orderQueue = await connectToQueue();
const marketDataClient = await connectToWS();
const engineStartedAt = Date.now();
const candleIntervals: Record<string, number> = {
  "1s": 1,
  "1m": 60,
  "15m": 15 * 60,
  "1h": 60 * 60,
  "4h": 4 * 60 * 60,
  "1D": 24 * 60 * 60,
  "1W": 7 * 24 * 60 * 60,
};
const candles = new Map<string, Candle[]>();
const loadedCandleHistories = new Set<string>();
const tradesBySymbol = new Map<string, Array<{ price: number; amount: number; timestamp: number }>>();
const tradePrunedAt = new Map<string, number>();
const recentTradesBySymbol = new Map<string, Array<Record<string, string | number>>>();
const latestTickerBySymbol = new Map<string, Record<string, number | string | boolean>>();
let tradeSequence = 0;

function candleStorageKey(symbol: string, timeframe: string) {
  return `market:candles:${symbol}:${timeframe}`;
}

async function loadCandleHistory(symbol: string, timeframe: string) {
  const key = `${symbol}:${timeframe}`;
  if (loadedCandleHistories.has(key)) return candles.get(key) ?? [];

  const storedCandles = await marketDataClient.client.lRange(candleStorageKey(symbol, timeframe), 0, -1);
  const history = storedCandles.flatMap((value) => {
    try {
      return [JSON.parse(value) as Candle];
    } catch {
      console.warn(`Skipping malformed stored candle for ${symbol} ${timeframe}`);
      return [];
    }
  });
  candles.set(key, history);
  loadedCandleHistories.add(key);
  return history;
}

function normalizeSymbol(symbol: string) {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function addToOrderbook(book: orderbook, order: any, sort = true) {
  const side = order.side === "BUY" ? book.bids : book.asks;
  side.push(order);
  if (sort) side.sort((a, b) => order.side === "BUY" ? b.price - a.price : a.price - b.price);
}

function matchOrder(book: orderbook, order: any): fill[] {
  const fills: fill[] = [];
  const oppositeSide = order.side === "BUY" ? book.asks : book.bids;
  let index = 0;

  while (index < oppositeSide.length && order.quantity > 0) {
    const restingOrder = oppositeSide[index];
    const crosses = order.type === "MARKET" || (order.side === "BUY"
      ? restingOrder.price <= order.price
      : restingOrder.price >= order.price);
    if (!crosses) break;

    const filledQuantity = Math.min(restingOrder.quantity, order.quantity);
    restingOrder.quantity -= filledQuantity;
    order.quantity -= filledQuantity;
    fills.push({ orderId: order.orderID, filledQuantity, price: restingOrder.price });

    if (restingOrder.quantity <= 0) oppositeSide.splice(index, 1);
    else index += 1;
  }
  return fills;
}

function getBookRows(side: any[], descending: boolean) {
  const levels = new Map<number, { quantity: number; orderCount: number }>();
  for (const order of side) {
    const level = levels.get(order.price) ?? { quantity: 0, orderCount: 0 };
    level.quantity += order.quantity;
    level.orderCount += 1;
    levels.set(order.price, level);
  }
  const sorted = [...levels.entries()].sort(([a], [b]) => descending ? b - a : a - b);
  const maxQuantity = sorted.reduce((max, [, level]) => Math.max(max, level.quantity), 1);
  let cumulativeQuantity = 0;

  return sorted.slice(0, 20).map(([price, level]) => {
    cumulativeQuantity += level.quantity;
    return {
      price,
      amount: level.quantity,
      quantity: level.quantity,
      orderCount: level.orderCount,
      total: price * cumulativeQuantity,
      depth: level.quantity / maxQuantity,
      cumulativeQuantity,
    };
  });
}

async function publishBook(symbol: string, book: orderbook, onlyStream?: "orderbook" | "depth") {
  const bids = getBookRows(book.bids, true);
  const asks = getBookRows(book.asks, false);
  const timestamp = Date.now();

  const publishes: Promise<number>[] = [];
  if (onlyStream !== "depth") {
    publishes.push(publishMarketData(marketDataClient, `orderbook:${symbol}`, {
      type: "snapshot", symbol, timestamp, bids, asks,
    }));
  }
  if (onlyStream !== "orderbook") {
    publishes.push(publishMarketData(marketDataClient, `depth:${symbol}`, {
    type: "snapshot",
    symbol,
    timestamp,
    bids,
    asks,
    bidOrderCount: book.bids.length,
    askOrderCount: book.asks.length,
    bidQuantity: bids.reduce((sum, level) => sum + level.quantity, 0),
    askQuantity: asks.reduce((sum, level) => sum + level.quantity, 0),
    }));
  }
  await Promise.all(publishes);
}

async function publishTrade(symbol: string, order: any, fill: fill) {
  const timestamp = Date.now();
  const trade = {
    id: `${order.orderID}-${++tradeSequence}`,
    symbol,
    side: order.side.toLowerCase(),
    price: fill.price,
    amount: fill.filledQuantity,
    time: timestamp,
    timestamp,
  };
  await publishMarketData(marketDataClient, `trades:${symbol}`, trade);

  const rollingTrades = tradesBySymbol.get(symbol) ?? [];
  rollingTrades.push({ price: fill.price, amount: fill.filledQuantity, timestamp });
  const cutoff = timestamp - 24 * 60 * 60 * 1000;
  if (timestamp - (tradePrunedAt.get(symbol) ?? 0) >= 60_000) {
    let expired = 0;
    while (expired < rollingTrades.length && rollingTrades[expired].timestamp < cutoff) expired += 1;
    if (expired) rollingTrades.splice(0, expired);
    tradePrunedAt.set(symbol, timestamp);
  }
  tradesBySymbol.set(symbol, rollingTrades);
  const baseVolume = rollingTrades.reduce((sum, item) => sum + item.amount, 0);
  const quoteVolume = rollingTrades.reduce((sum, item) => sum + item.amount * item.price, 0);
  const firstPrice = rollingTrades[0]?.price ?? fill.price;
  const high24h = rollingTrades.reduce((high, item) => Math.max(high, item.price), Number.NEGATIVE_INFINITY);
  const low24h = rollingTrades.reduce((low, item) => Math.min(low, item.price), Number.POSITIVE_INFINITY);
  const ticker = {
    symbol,
    price: fill.price,
    change24h: firstPrice ? ((fill.price - firstPrice) / firstPrice) * 100 : 0,
    high24h,
    low24h,
    baseVolume24h: baseVolume,
    quoteVolume24h: quoteVolume,
    hasFull24h: timestamp - engineStartedAt >= 24 * 60 * 60 * 1000,
    timestamp,
  };
  latestTickerBySymbol.set(symbol, ticker);
  await publishMarketData(marketDataClient, `ticker:${symbol}`, ticker);

  const recent = recentTradesBySymbol.get(symbol) ?? [];
  recent.unshift(trade);
  if (recent.length > 1000) recent.pop();
  recentTradesBySymbol.set(symbol, recent);

  const timeSeconds = Math.floor(timestamp / 1000);
  for (const [timeframe, interval] of Object.entries(candleIntervals)) {
    const time = Math.floor(timeSeconds / interval) * interval;
    const key = `${symbol}:${timeframe}`;
    const history = await loadCandleHistory(symbol, timeframe);
    const existing = history[history.length - 1];
    const candle: Candle = existing && existing.time === time
      ? { ...existing, high: Math.max(existing.high, fill.price), low: Math.min(existing.low, fill.price), close: fill.price, volume: existing.volume + fill.filledQuantity }
      : { time, open: fill.price, high: fill.price, low: fill.price, close: fill.price, volume: fill.filledQuantity };
    const storageKey = candleStorageKey(symbol, timeframe);
    if (existing && existing.time === time) {
      history[history.length - 1] = candle;
      await marketDataClient.client.lSet(storageKey, -1, JSON.stringify(candle));
    } else {
      history.push(candle);
      await marketDataClient.client.rPush(storageKey, JSON.stringify(candle));
    }
    candles.set(key, history);
    await publishMarketData(marketDataClient, `chart:${symbol}:${timeframe}`, {
      type: "candle", symbol, timeframe, candle,
    });
  }
}

async function publishRequestedSnapshot(topic: string) {
  const [stream, symbol, timeframe] = topic.split(":");
  if (!symbol) return;

  if (stream === "orderbook" || stream === "depth") {
    await publishBook(symbol, getOrderbook(symbol), stream);
  } else if (stream === "ticker") {
    const ticker = latestTickerBySymbol.get(symbol);
    if (ticker) await publishMarketData(marketDataClient, topic, ticker);
  } else if (stream === "trades") {
    const trades = (recentTradesBySymbol.get(symbol) ?? []).slice(0, 50);
    await publishMarketData(marketDataClient, topic, { type: "snapshot", symbol, trades });
  } else if (stream === "chart" && timeframe && candleIntervals[timeframe]) {
    const history = await loadCandleHistory(symbol, timeframe);
    await publishMarketData(marketDataClient, topic, {
      type: "snapshot", symbol, timeframe, candles: history,
    });
  }
}

async function processQuoteBatch(rawOrders: any[]) {
  if (rawOrders.length > 20_000) {
    console.error(`Ignoring oversized market-maker quote batch (${rawOrders.length} orders)`);
    return;
  }

  const changedSymbols = new Set<string>();
  let added = 0;
  for (const rawOrder of rawOrders) {
    const symbol = normalizeSymbol(String(rawOrder.symbol ?? ""));
    const price = Number(rawOrder.price);
    const quantity = Number(rawOrder.quantity);
    if (!symbol || !Number.isFinite(price) || price <= 0 || !Number.isFinite(quantity) || quantity <= 0 ||
        rawOrder.type !== "LIMIT" || !["BUY", "SELL"].includes(rawOrder.side) ||
        typeof rawOrder.orderID !== "string") continue;

    const book = getOrderbook(symbol);
    const oppositeSide = rawOrder.side === "BUY" ? book.asks : book.bids;
    const bestOppositePrice = oppositeSide[0]?.price;
    if (bestOppositePrice !== undefined && (rawOrder.side === "BUY" ? price >= bestOppositePrice : price <= bestOppositePrice)) {
      continue;
    }

    addToOrderbook(book, { ...rawOrder, symbol, price, quantity, orderId: rawOrder.orderID }, false);
    changedSymbols.add(symbol);
    added += 1;
  }

  for (const symbol of changedSymbols) {
    const book = getOrderbook(symbol);
    book.bids.sort((a, b) => b.price - a.price);
    book.asks.sort((a, b) => a.price - b.price);
    await publishBook(symbol, book);
  }
  console.info(`Engine added ${added} passive quotes from a market-maker batch`);
}

async function processOrder(rawOrder: any) {
  if (rawOrder.action === "batch" && Array.isArray(rawOrder.orders)) {
    await processQuoteBatch(rawOrder.orders);
    return;
  }

  const symbol = normalizeSymbol(String(rawOrder.symbol ?? ""));
  if (rawOrder.action === "cancelBatch" && symbol && Array.isArray(rawOrder.orderIDs)) {
    const orderIDs = new Set(rawOrder.orderIDs.filter((orderID: unknown): orderID is string => typeof orderID === "string"));
    const book = getOrderbook(symbol);
    const beforeCount = book.bids.length + book.asks.length;
    book.bids = book.bids.filter((order) => !orderIDs.has(order.orderId));
    book.asks = book.asks.filter((order) => !orderIDs.has(order.orderId));
    if (book.bids.length + book.asks.length !== beforeCount) await publishBook(symbol, book);
    return;
  }

  if (rawOrder.action === "cancel") {
    if (!symbol || typeof rawOrder.orderID !== "string") return;
    const book = getOrderbook(symbol);
    let removed = false;
    for (const side of [book.bids, book.asks]) {
      for (let index = side.length - 1; index >= 0; index -= 1) {
        if (side[index].orderId === rawOrder.orderID) {
          side.splice(index, 1);
          removed = true;
        }
      }
    }
    if (removed) await publishBook(symbol, book);
    return;
  }

  const requestedQuantity = Number(rawOrder.quantity);
  const order = {
    ...rawOrder,
    symbol,
    price: Number(rawOrder.price),
    quantity: requestedQuantity,
  };

  if (!symbol || !Number.isFinite(requestedQuantity) || requestedQuantity <= 0 ||
      !Number.isFinite(order.price) || (order.type === "LIMIT" && order.price <= 0) ||
      !["BUY", "SELL"].includes(order.side) || !["MARKET", "LIMIT"].includes(order.type)) {
    console.error("Ignoring malformed order", rawOrder);
    return;
  }

  const book = getOrderbook(symbol);
  const fills = matchOrder(book, order);
  for (const fill of fills) await publishTrade(symbol, order, fill);

  if (order.quantity > 0 && order.type !== "MARKET" && !order.kind) {
    addToOrderbook(book, { ...order, orderId: order.orderID });
  }
  await publishBook(symbol, book);

  const response: responseObject = {
    orderId: order.orderID,
    symbol,
    executedQuantity: fills.reduce((sum, fill) => sum + fill.filledQuantity, 0),
    remainingQuantity: Math.max(0, requestedQuantity - fills.reduce((sum, fill) => sum + fill.filledQuantity, 0)),
    fills,
  };
  await sendOrderStatus(JSON.stringify(response));
}

async function consumeOrders() {
  while (true) {
    try {
      const queued = await orderQueue.getDataFromQueue();
      if (!queued) continue;
      console.info("Engine picked up queued order:", queued.element);
      await processOrder(JSON.parse(queued.element));
    } catch (error) {
      console.error("Failed to process queued order", error);
    }
  }
}

await marketDataClient.subscribeToBroker("snapshot:REQUEST", (rawMessage) => {
  try {
    const request = JSON.parse(rawMessage) as { topic?: unknown };
    if (typeof request.topic === "string") void publishRequestedSnapshot(request.topic);
  } catch (error) {
    console.error("Ignoring invalid market snapshot request", error);
  }
});

void consumeOrders();
