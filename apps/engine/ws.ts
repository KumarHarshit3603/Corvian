import { RedisPubSubClient,RedisQueueClient } from "@corvian/common";
const RedisServerB = process.env.REDIS_SERVERB || "redis://localhost:6379";

export async function connectToWS(){
        const wsConnectionInstance = RedisPubSubClient.getInstance(RedisServerB);
        const connectionCreated = wsConnectionInstance.connectToClient();
        if(!connectionCreated){
            console.log("ws server connection error");
        }
        return wsConnectionInstance;
}
export async function sendToWS(wsConnectionInstance: RedisPubSubClient,data: string , topic : string){
        return  wsConnectionInstance.publishToBroker(topic , data);
}
connectToWS();
