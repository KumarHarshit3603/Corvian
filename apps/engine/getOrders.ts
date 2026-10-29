import { RedisQueueClient , RedisPubSubClient } from "@corvian/common";
import 'dotenv/config'
const RedisServer = process.env.REDIS_SERVER1 || "redis://localhost:6379";
console.log(RedisServer)
async function sendOrderStatus(orderStatus : string){
    const instance = RedisPubSubClient.getInstance(RedisServer);
    const connectionCreated = instance.connectToClient();
    const success = await instance.publishToBroker("orderStatus",orderStatus);
    console.log(success);
}
async function connectToQueue(){
    const instance = RedisQueueClient.getInstance(RedisServer);
    const connectionCreated = instance.connectToClient();
    if(!connectionCreated){
        console.log("couldn't connect to queue");
    }
    while(true){
         const data = await instance.getDataFromQueue();
        if(data)console.log(data);
        if(data)sendOrderStatus(data?.element)
    }
    }
connectToQueue();