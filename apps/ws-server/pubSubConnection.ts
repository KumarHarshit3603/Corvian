import { RedisPubSubClient } from "@corvian/common";

export function createConnection():RedisPubSubClient{
    const instance = RedisPubSubClient.getInstance("redis://localhost:6000");
    const connectionCreated = instance.connectToClient();

    return instance;
}