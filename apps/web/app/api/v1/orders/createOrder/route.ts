import {orderdata} from '@/app/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import {RedisPubSubClient, RedisQueueClient} from '@corvian/common'
import 'dotenv/config'

const RedisServer = process.env.REDIS_SERVER1 || "redis://localhost:6379";
console.log(RedisServer);
async function sendAndAwait(queueClientInstance:RedisQueueClient,data: any){
    const pubSubClientInstance = RedisPubSubClient.getInstance(RedisServer);
    const connectionCreated = await pubSubClientInstance.connectToClient();
    if (connectionCreated) {
        await pubSubClientInstance.subscribeToBroker("orderStatus", (message) => {
            console.log("Order status received from pub/sub:", message);
        });
    }
       const success = await queueClientInstance.sendDataToQueue(data);

       const timeout = setTimeout(()=>{
             pubSubClientInstance.unsubscribeToBroker("orderStatus");
            return null;
       },10000)



}
export async function POST(req: NextRequest) {
    const body = await req.json();
    const valid = orderdata.safeParse(body);
    if(!valid.success){
        return NextResponse.json({
            message:"invalid order"
        },
        {status: 400}
    )
    }
    const queueClientInstance = RedisQueueClient.getInstance(RedisServer);
    try {
        await queueClientInstance.connectToClient();
    } catch (error) {
        console.error("Could not connect to the order queue", error);
        return NextResponse.json(
            {message: "Can't place order"},
            {status: 503}
        )
    }
 
    await sendAndAwait(queueClientInstance,valid.data);
    
    return NextResponse.json(
       { message: "order placed successfully" },
       {status: 200}   
    )
    
}
