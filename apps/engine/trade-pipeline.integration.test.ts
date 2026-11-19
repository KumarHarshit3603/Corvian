import { describe, expect, it } from "vitest";
import { TRADE_HISTORY_QUEUE, type TradeRecord } from "@corvian/common/trade";
import { processNextTrade, toTradePersistenceData, type TradeHistoryQueue } from "../database-processor/tradeQueueProcessor";
import { addToOrderbook, createOrderbook, matchOrder, type order } from "./orderbook";
import { createTradeRecord, enqueueTradeRecord } from "./tradeHistory";

const PROCESSING_QUEUE = `${TRADE_HISTORY_QUEUE}:processing`;
const DEAD_LETTER_QUEUE = `${TRADE_HISTORY_QUEUE}:dead-letter`;

class InMemoryRedisQueues implements TradeHistoryQueue {
  private readonly lists = new Map<string, string[]>();

  private list(queueName: string) {
    const list = this.lists.get(queueName) ?? [];
    this.lists.set(queueName, list);
    return list;
  }

  async sendDataToQueue(data: unknown, queueName = "demodata") {
    this.list(queueName).unshift(JSON.stringify(data));
    return this.list(queueName).length;
  }

  async getPendingQueueData(queueName: string) {
    const element = this.list(queueName).at(-1);
    return element === undefined ? null : { key: queueName, element };
  }

  async claimDataFromQueue(sourceQueue: string, processingQueue: string) {
    const element = this.list(sourceQueue).pop();
    if (element === undefined) return null;
    this.list(processingQueue).unshift(element);
    return { key: processingQueue, element };
  }

  async acknowledgeQueueData(queueName: string, element: string) {
    const index = this.list(queueName).indexOf(element);
    if (index < 0) return 0;
    this.list(queueName).splice(index, 1);
    return 1;
  }

  pushRaw(queueName: string, element: string) {
    this.list(queueName).unshift(element);
  }

  listValues(queueName: string) {
    return [...this.list(queueName)];
  }
}

function makeMatchedTrade() {
  const book = createOrderbook();
  const maker: order = {
    orderId: "maker-sell-1",
    symbol: "BTCUSDT",
    side: "SELL",
    type: "LIMIT",
    price: 67_000,
    quantity: 0.25,
  };
  const taker: order = {
    orderId: "taker-buy-1",
    symbol: "BTCUSDT",
    side: "BUY",
    type: "MARKET",
    price: 0,
    quantity: 0.25,
  };
  addToOrderbook(book, maker);
  const [fill] = matchOrder(book, taker);
  if (!fill) throw new Error("Expected the taker order to match the maker order");

  return createTradeRecord(taker, fill, 1_800_000_000_123, "trade-1");
}

describe("trade-history pipeline integration", () => {
  it("matches an order, queues the trade, persists the mapped record, then acknowledges it", async () => {
    const queue = new InMemoryRedisQueues();
    const trade = makeMatchedTrade();
    const savedRows = new Map<string, ReturnType<typeof toTradePersistenceData>>();

    await enqueueTradeRecord(queue, trade);
    expect(queue.listValues(TRADE_HISTORY_QUEUE)).toHaveLength(1);

    const result = await processNextTrade(queue, async (record) => {
      const row = toTradePersistenceData(record);
      savedRows.set(row.id, row);
    });

    expect(result).toEqual({ status: "saved", trade });
    expect(savedRows.get("trade-1")).toEqual({
      id: "trade-1",
      symbol: "BTCUSDT",
      side: "buy",
      orderType: "MARKET",
      takerOrderId: "taker-buy-1",
      makerOrderId: "maker-sell-1",
      buyOrderId: "taker-buy-1",
      sellOrderId: "maker-sell-1",
      price: "67000",
      amount: "0.25",
      quoteAmount: "16750",
      time: 1_800_000_000_123n,
      timestamp: 1_800_000_000_123n,
      payload: trade,
    });
    expect(queue.listValues(TRADE_HISTORY_QUEUE)).toEqual([]);
    expect(queue.listValues(PROCESSING_QUEUE)).toEqual([]);
  });

  it("keeps a claimed message pending when persistence fails and retries it on the next pass", async () => {
    const queue = new InMemoryRedisQueues();
    const trade = makeMatchedTrade();
    await enqueueTradeRecord(queue, trade);

    await expect(processNextTrade(queue, async () => {
      throw new Error("database unavailable");
    })).rejects.toThrow("database unavailable");

    expect(queue.listValues(TRADE_HISTORY_QUEUE)).toEqual([]);
    expect(queue.listValues(PROCESSING_QUEUE)).toHaveLength(1);

    const result = await processNextTrade(queue, async () => {});
    expect(result).toEqual({ status: "saved", trade });
    expect(queue.listValues(PROCESSING_QUEUE)).toEqual([]);
  });

  it("dead-letters malformed queue data and acknowledges it", async () => {
    const queue = new InMemoryRedisQueues();
    queue.pushRaw(TRADE_HISTORY_QUEUE, "not-json");

    const result = await processNextTrade(queue, async () => {
      throw new Error("Invalid data must not reach persistence");
    });

    expect(result).toEqual({ status: "dead-lettered" });
    expect(queue.listValues(PROCESSING_QUEUE)).toEqual([]);
    expect(queue.listValues(TRADE_HISTORY_QUEUE)).toEqual([]);
    expect(JSON.parse(queue.listValues(DEAD_LETTER_QUEUE)[0])).toMatchObject({ raw: "not-json" });
  });

  it("returns idle when Redis C has no trade to process", async () => {
    const queue = new InMemoryRedisQueues();
    const result = await processNextTrade(queue, async (_trade: TradeRecord) => {});
    expect(result).toEqual({ status: "idle" });
  });
});
