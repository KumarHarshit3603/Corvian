import {WebSocketServer} from 'ws'
import express from 'express'
import { createConnection } from './pubSubConnection';
const app = express();
const PORT = 5000;

const instance = createConnection();
const wsserver = app.listen(PORT,()=>{
    console.log("server started")
})

function webSocketConnection(){
    const wss = new WebSocketServer({server: wsserver});

    wss.on("connection",(ws)=>{
        
        ws.on("error",(err)=>{
            console.log(err);
        })
        ws.on("message",(data)=>{
            const message = data.toString();
            console.log(message);
            const obj = JSON.parse(message);
            if(obj.type == "subscribe"){
               instance.subscribeToBroker(obj.topic);
            }
            else if (obj.type == "unsubscribe"){
                instance.unsubscribeToBroker(obj.topic);
            }


        })
        ws.on("close",()=>{
            console.log("connection closed");
        })
    })

}
webSocketConnection();