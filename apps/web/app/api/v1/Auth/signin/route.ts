import { NextRequest, NextResponse } from "next/server"
import {db} from '@/prisma/db'
import bcrypt from "bcryptjs";
export async function POST(req:NextRequest, res:NextResponse){
    const body = await req.json();
    const {username, email , password} = body;

    try{
        const found = await db.orm.public.User.where({
            username : username,
        }).first();
        if(!found){
            return NextResponse.json({
                message: "no such user exists",
                status: 404
            })
        }
        const valid = await bcrypt.compare(password,found?.password);
        if(!valid){
            return NextResponse.json({
                message: "wrong password",
                status: 400
            })
        }
        return NextResponse.json({
            message: "successfully signed in ",
            status : 200
        })


    }


    catch(e){
        return NextResponse.json({
            message: "some error occurred",
            status: 500
        })
    }
}