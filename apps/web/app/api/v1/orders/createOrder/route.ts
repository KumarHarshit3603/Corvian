import {orderdata} from '@/app/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import {RedisPubSubClient, RedisQueueClient} from '@corvian/common'
import 'dotenv/config'

const RedisServer = process.env.REDIS_SERVER1 || "redis://localhost:6379";
console.log(RedisServer);
async function sendAndAwait(queueClientInstance:RedisQueueClient,data: any){
       const success = await queueClientInstance.sendDataToQueue(data);

       const timeout = setTimeout(()=>{
             pubSubClientInstance.unsubscribeToBroker("orderStatus");
            return null;
       },10000)

       const pubSubClientInstance = RedisPubSubClient.getInstance(RedisServer);
       const connectionCreated =  pubSubClientInstance.connectToClient();
       if(connectionCreated) await pubSubClientInstance.subscribeToBroker("orderStatus");

}
export async function POST(req:NextRequest,res: NextResponse){
    const body = await req.json();
    const valid = orderdata.safeParse(body);
    if(!valid){
        return NextResponse.json({
            message:"invalid order"
        },
        {status: 400}
    )
    }
    const queueClientInstance = RedisQueueClient.getInstance(RedisServer);
    const connectionCreated = queueClientInstance.connectToClient();
    if(!connectionCreated){
        return NextResponse.json(
            {message: "cant place order"},
            {status: 500}
        )
    }
 
    await sendAndAwait(queueClientInstance,body);
    
    return NextResponse.json(
       { message: "order placed successfully" },
       {status: 200}   
    )
    
}