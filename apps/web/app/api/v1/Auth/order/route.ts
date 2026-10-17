import {orderdata} from '@/app/utils/validation'
import { NextRequest, NextResponse } from 'next/server'
import {db} from "@/prisma/db"
export async function POST(req:NextRequest,res: NextResponse){
    const body = await req.json();
    const valid = body.safeParse(orderdata);
    if(!valid){
        return NextResponse.json({
            message:"invalid order",
            status : 400
        })
    }
    
}