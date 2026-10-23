import { singletonRedisClient } from "@corvian/common";
import { connect } from "node:http2";

async function getQueueData(instance: singletonRedisClient){
    return await instance.client.brPop("demodata",0);
}
async function connectToQueue(){
    const instance = singletonRedisClient.getInstance();
    const success = instance.connectToClient();
    if(!success){
        console.log("couldn't connect to queue");
    }
    const data = await  getQueueData(instance);
    console.log(data);
}
connectToQueue();