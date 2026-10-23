"use client"
import {useState} from "react"

export default function Signin(){
    const username = useState("")
    const password = useState("")
    return(
        <>
            <div>Sign in </div>
            <div>
                <input type ="text" placeholder = "username"></input>
                <input type ="password" placeholder = "password"></input>
                <button>Sign in</button>
            </div>
        </>
    )
}