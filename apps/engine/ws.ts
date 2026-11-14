import { RedisPubSubClient } from "@corvian/common";

const redisUrl = process.env.REDIS_SERVERB || "redis://localhost:6380";

export async function connectToWS() {
  const client = RedisPubSubClient.getInstance(redisUrl);
  await client.connectToClient();
  return client;
}

export async function publishMarketData(
  client: RedisPubSubClient,
  topic: string,
  payload: unknown,
) {
  try {
    return await client.publishToBroker(topic, JSON.stringify(payload));
  } catch (error) {
    console.error(`Could not publish market data to ${topic}`, error);
    return 0;
  }
}
