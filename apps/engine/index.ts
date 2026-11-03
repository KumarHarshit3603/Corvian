import { connectToQueue ,sendOrderStatus} from "./getOrders";
import {connectToWS,sendToWS} from "./ws"
import { orderbook } from "./orderbook";
import { fill } from "./orderbook";
const orderQueueInstance = await connectToQueue();
const wsConnectionInstance = await connectToWS();


async function pickUpOrder(){
    while(true){
        const data = await orderQueueInstance.getDataFromQueue();
        if(!data) {
            console.log("couldn't get data");
            continue;
        }
        console.log(data);
        
        const orderdata = JSON.parse(data.element);
        addToOrderbook(orderdata);

        //send data to ws server
        // await sendOrderStatus(data?.element);
        // const success = await sendToWS(wsConnectionInstance,data.element,"demotopic");
        // console.log(success);
    }
}
function addToOrderbook(orderdata:any ){
        if(orderdata.side == "BUY"){
            orderbook.bids.push(orderdata);
        }
        else{
            orderbook.asks.push(orderdata);
        }
}
function fillOrder(order:any):fill[]{
        let fills : fill[] = [];

        if(order.side == "BUY"){
            let i = 0 ;
            while(i<orderbook.asks.length){
                if(orderbook.asks[i].price <= order.price&&order.quantity>0){
                    const filledQuantity = Math.min(orderbook.asks[i].quantity,order.quantity);
                    orderbook.asks[i].quantity -= filledQuantity;
                    order.quantity -= filledQuantity;
                    
                    fills.push({
                        orderId : order.orderId,
                        filledQuantity : filledQuantity,
                        remainingQuantity : order.quantity
                    })
                }
                if(orderbook.asks[i].quantity == 0){
                    orderbook.asks.splice(i,1);
                    continue;
                }
                i++;
            }
        }
        else{
            let i = 0; 
            while(i<orderbook.bids.length){
                if(orderbook.bids[i].price >= order.price && order.quantity >0){
                    const filledQuantity = Math.min(orderbook.bids[i].quantity, order.quantity);
                    orderbook.bids[i].quantity -= filledQuantity;
                    order.quantity -= filledQuantity;

                     fills.push({
                        orderId : order.orderId,
                        filledQuantity : filledQuantity,
                        remainingQuantity : order.quantity
                    })
                }
                if(orderbook.bids[i].quantity == 0){
                    orderbook.bids.splice(i,1);
                    continue;
                }
                i++;
            }
        }
        return fills;
}
pickUpOrder();
