"use client"
import {useState} from 'react'
export default function Signup(){
    const name = useState("")
    const email = useState("")
    const username = useState("")
    const password = useState("")
    const confirmpassword = useState("")

    interface userdata {
        name : string,
        email : string,
        username : string,
        password : string,
        confirmpassword : string
    }
    function checkUsernameExists(username:string):boolean{
        
    }
    function checkEmailExists(email:string):boolean{

    }
    function signup(userdata:userdata){
        if(password!=confirmpassword){
            console.log("passwords do not match");
        }
        if(!checkUsernameExists(userdata.username)){
            console.log("username already exists")
        }
        if(!checkEmailExists(userdata.email)){
            console.log("email already registered")
        }
        
        
    }
    return(
        <>
        <div>Sign up</div>
        <div>
            <input type = "text" placeholder="name"></input>
            <input type = "text" placeholder="email"></input>
            <input type = "text" placeholder="username"></input>
            <input type = "password" placeholder="password"></input>
            <input type = "password" placeholder="re-enter password"></input>
            <button>Sign Up</button>
        </div>
        </>
    )
}