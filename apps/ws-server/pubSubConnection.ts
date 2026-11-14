import { RedisPubSubClient } from "@corvian/common";

export async function createConnection(): Promise<RedisPubSubClient> {
    const redisUrl = process.env.REDIS_SERVERB || "redis://localhost:6380";
    const instance = RedisPubSubClient.getInstance(redisUrl);
    await instance.connectToClient();
    return instance;
}
