import { RedisQueueClient } from "@corvian/common";
import { TRADE_HISTORY_QUEUE, type TradeRecord } from "@corvian/common/trade";
import { db } from "@corvian/database/db";
import { processNextTrade, toTradePersistenceData } from "./tradeQueueProcessor";

const REDIS_SERVERC = process.env.REDIS_SERVERC || "redis://localhost:6381";
const queue = RedisQueueClient.getInstance(REDIS_SERVERC);

async function saveTrade(trade: TradeRecord) {
  const data = toTradePersistenceData(trade);

  await db.orm.public.Trade.where({ id: trade.id }).upsert({
    create: data,
    update: { id: trade.id },
  });
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function processTradeQueue() {
  // Fail before claiming queue items if Prisma cannot reach the database or
  // the Trade table has not been provisioned by the shared migration yet.
  await db.orm.public.Trade.first();
  await queue.connectToClient();
  console.info(`Database processor listening on Redis C queue "${TRADE_HISTORY_QUEUE}"`);

  for (;;) {
    try {
      const result = await processNextTrade(queue, saveTrade);
      if (result.status === "saved") {
        console.info(`Saved trade ${result.trade.id} (${result.trade.symbol})`);
      } else if (result.status === "dead-lettered") {
        console.error("Moved an invalid trade message to the dead-letter queue");
      }
    } catch (error) {
      console.error("Could not process the trade-history queue; retrying", error);
      await wait(1_000);
    }
  }
}

process.once("SIGINT", () => {
  void db.close().finally(() => process.exit(0));
});
process.once("SIGTERM", () => {
  void db.close().finally(() => process.exit(0));
});

void processTradeQueue().catch(async (error) => {
  console.error("Database processor failed to start", error);
  await db.close();
  process.exitCode = 1;
});
