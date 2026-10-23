import {orderdata} from '@/app/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import {singletonRedisClient} from '@corvian/common'

function createConnection(instance:singletonRedisClient){
    return instance.connectToClient();
}
async function sendAndAwait(instance: singletonRedisClient, data:any):Promise<string | null>{
    try{
        await instance.client.lPush("demodata",JSON.stringify(data));

    }
    catch(e){
        console.log(e);
    }

    return await instance.client.rPop("demodata");//just for testing , later will receive data from pub/sub system.

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
    const instance = singletonRedisClient.getInstance();
    if(!createConnection(instance)){
        return NextResponse.json(
            {message: "couldn't connect"},
            {status : 500}
        )
    }
    const response = await sendAndAwait(instance, body);
    
    
    console.log(response);

    return NextResponse.json(
       { message: "order placed successfully" },
       {status: 200}   
    )
    
}