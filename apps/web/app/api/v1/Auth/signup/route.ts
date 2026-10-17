import {NextRequest,NextResponse} from 'next/server'
import bcrypt from 'bcryptjs'
import {userdata} from '@/app/utils/validation'
import {db} from '@/prisma/db'
export  async function POST(req:NextRequest,res:NextResponse){
    const body = await req.json();
    try{
        const valid = userdata.safeParse(body);
        if(!valid) return NextResponse.json(
            {message:"invalid format",
            status:400})
        const {name,username,email} = body;
        const hashedpassword = await bcrypt.hash(body.password,12);
        const data = {
            name,
            username,
            email,
            password:hashedpassword
        }
    const created = await db.orm.public.User.create(data);
    console.log(created);

    return NextResponse.json({message :"done"});
    }
    catch(e){
        return NextResponse.json({
            message: "some error occurred",
            status: 500
        })
    }
}