import { RedisQueueClient , RedisPubSubClient } from "@corvian/common";
import 'dotenv/config'
const RedisServerA = process.env.REDIS_SERVERA || "redis://localhost:6379";


console.log(RedisServerA)
export async function sendOrderStatus(orderStatus : string){
    const instance = RedisPubSubClient.getInstance(RedisServerA);
    const connectionCreated = instance.connectToClient();
    const success = await instance.publishToBroker("orderStatus",orderStatus);
    console.log(success);
}
export async function connectToQueue(){
    const instance = RedisQueueClient.getInstance(RedisServerA);
    const connectionCreated = instance.connectToClient();
    if(!connectionCreated){
        console.log("couldn't connect to queue");
    }
    return instance;
}

