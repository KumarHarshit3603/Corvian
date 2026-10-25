import { RedisQueueClient , RedisPubSubClient } from "@corvian/common";

async function sendOrderStatus(orderStatus : string){
    const instance = RedisPubSubClient.getInstance();
    const connectionCreated = instance.connectToClient();
    const success = await instance.publishToBroker("orderStatus",orderStatus);
    console.log(success);
}
async function connectToQueue(){
    const instance = RedisQueueClient.getInstance();
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