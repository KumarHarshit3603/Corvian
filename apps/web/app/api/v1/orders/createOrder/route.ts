import {orderdata} from '@/app/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import {RedisPubSubClient, RedisQueueClient} from '@corvian/common'

async function sendAndAwait(queueClientInstance:RedisQueueClient,data: any){
       const success = await queueClientInstance.sendDataToQueue(data);

       const timeout = setTimeout(()=>{
             pubSubClintInstance.unsubscribeToBroker("orderStatus");
            return null;
       },10000)

       const pubSubClintInstance = RedisPubSubClient.getInstance();
       const connectionCreated =  pubSubClintInstance.connectToClient();
       if(connectionCreated) await pubSubClintInstance.subscribeToBroker("orderStatus");

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
    const queueClientInstance = RedisQueueClient.getInstance();
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