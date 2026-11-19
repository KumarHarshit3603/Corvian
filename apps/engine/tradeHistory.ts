import { randomUUID } from "node:crypto";
import type { RedisQueueClient } from "@corvian/common";
import { TRADE_HISTORY_QUEUE, type TradeRecord } from "@corvian/common/trade";
import type { fill, order } from "./orderbook";

export function createTradeRecord(
  takerOrder: order,
  fill: fill,
  timestamp = Date.now(),
  id: string = randomUUID(),
): TradeRecord {
  return {
    id,
    symbol: takerOrder.symbol,
    side: takerOrder.side === "BUY" ? "buy" : "sell",
    orderType: takerOrder.type,
    takerOrderId: fill.orderId,
    makerOrderId: fill.makerOrderId,
    buyOrderId: takerOrder.side === "BUY" ? fill.orderId : fill.makerOrderId,
    sellOrderId: takerOrder.side === "SELL" ? fill.orderId : fill.makerOrderId,
    price: fill.price,
    amount: fill.filledQuantity,
    quoteAmount: fill.price * fill.filledQuantity,
    time: timestamp,
    timestamp,
  };
}

export async function enqueueTradeRecord(
  queue: Pick<RedisQueueClient, "sendDataToQueue">,
  trade: TradeRecord,
) {
  return queue.sendDataToQueue(trade, TRADE_HISTORY_QUEUE);
}
