import type { RedisQueueClient } from "@corvian/common";
import { TRADE_HISTORY_QUEUE, type TradeRecord } from "@corvian/common/trade";

const DEAD_LETTER_QUEUE = `${TRADE_HISTORY_QUEUE}:dead-letter`;
const PROCESSING_QUEUE = `${TRADE_HISTORY_QUEUE}:processing`;

export type TradeHistoryQueue = Pick<
  RedisQueueClient,
  "getPendingQueueData" | "claimDataFromQueue" | "sendDataToQueue" | "acknowledgeQueueData"
>;

export type TradePersistenceData = {
  id: string;
  symbol: string;
  side: TradeRecord["side"];
  orderType: TradeRecord["orderType"];
  takerOrderId: string;
  makerOrderId: string;
  buyOrderId: string;
  sellOrderId: string;
  price: string;
  amount: string;
  quoteAmount: string;
  time: bigint;
  timestamp: bigint;
  payload: TradeRecord;
};

export type TradeProcessResult =
  | { status: "idle" }
  | { status: "saved"; trade: TradeRecord }
  | { status: "dead-lettered" };

export function isTradeRecord(value: unknown): value is TradeRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const trade = value as Record<string, unknown>;
  return typeof trade.id === "string" && trade.id.length > 0 &&
    typeof trade.symbol === "string" && /^[A-Z0-9]{2,32}$/i.test(trade.symbol) &&
    (trade.side === "buy" || trade.side === "sell") &&
    (trade.orderType === "MARKET" || trade.orderType === "LIMIT") &&
    typeof trade.takerOrderId === "string" && trade.takerOrderId.length > 0 &&
    typeof trade.makerOrderId === "string" && trade.makerOrderId.length > 0 &&
    typeof trade.buyOrderId === "string" && trade.buyOrderId.length > 0 &&
    typeof trade.sellOrderId === "string" && trade.sellOrderId.length > 0 &&
    typeof trade.price === "number" && Number.isFinite(trade.price) && trade.price > 0 &&
    typeof trade.amount === "number" && Number.isFinite(trade.amount) && trade.amount > 0 &&
    typeof trade.quoteAmount === "number" && Number.isFinite(trade.quoteAmount) && trade.quoteAmount > 0 &&
    typeof trade.time === "number" && Number.isFinite(trade.time) &&
    typeof trade.timestamp === "number" && Number.isFinite(trade.timestamp);
}

export function toTradePersistenceData(trade: TradeRecord): TradePersistenceData {
  return {
    id: trade.id,
    symbol: trade.symbol,
    side: trade.side,
    orderType: trade.orderType,
    takerOrderId: trade.takerOrderId,
    makerOrderId: trade.makerOrderId,
    buyOrderId: trade.buyOrderId,
    sellOrderId: trade.sellOrderId,
    price: String(trade.price),
    amount: String(trade.amount),
    quoteAmount: String(trade.quoteAmount),
    time: BigInt(trade.time),
    timestamp: BigInt(trade.timestamp),
    payload: trade,
  };
}

export async function processNextTrade(
  queue: TradeHistoryQueue,
  persistTrade: (trade: TradeRecord) => Promise<void>,
): Promise<TradeProcessResult> {
  let message = await queue.getPendingQueueData(PROCESSING_QUEUE);
  if (!message) message = await queue.claimDataFromQueue(TRADE_HISTORY_QUEUE, PROCESSING_QUEUE);
  if (!message) return { status: "idle" };

  let decoded: unknown;
  try {
    decoded = JSON.parse(message.element);
  } catch (error) {
    await queue.sendDataToQueue({
      raw: message.element,
      error: String(error),
      failedAt: new Date().toISOString(),
    }, DEAD_LETTER_QUEUE);
    await queue.acknowledgeQueueData(PROCESSING_QUEUE, message.element);
    return { status: "dead-lettered" };
  }

  if (!isTradeRecord(decoded)) {
    await queue.sendDataToQueue({
      raw: decoded,
      error: "Invalid trade record",
      failedAt: new Date().toISOString(),
    }, DEAD_LETTER_QUEUE);
    await queue.acknowledgeQueueData(PROCESSING_QUEUE, message.element);
    return { status: "dead-lettered" };
  }

  await persistTrade(decoded);
  await queue.acknowledgeQueueData(PROCESSING_QUEUE, message.element);
  return { status: "saved", trade: decoded };
}
