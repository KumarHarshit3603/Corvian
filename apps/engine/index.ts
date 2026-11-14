import { connectToQueue ,sendOrderStatus} from "./getOrders";
import {connectToWS,sendToWS} from "./ws"
import { orderbook,fill, responseObject } from "./orderbook";
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
        const orderFillStatus = fillOrder(orderdata);
        const responseObject = generateResponse(orderFillStatus,orderdata);
        console.log(responseObject);
        await sendOrderStatus(JSON.stringify(responseObject, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
        // await sendOrderStatus("hello");
        // const success = await sendToWS(wsConnectionInstance,data.element,"demotopic");
        // console.log(success);
    }
}
function addToOrderbook(orderdata:any ){
        if(orderdata.side == "BUY" && orderbook.bids.length == 0){
            orderbook.bids.push(orderdata);
        }
        else if(orderdata.side == "BUY" && orderbook.bids.length > 0){
            
            let i = 0 ;
            while(i<orderbook.bids.length&&orderbook.bids[i].price <= orderdata.price)i++;
            orderbook.bids.splice(i,0,orderdata);
        }
        else if(orderdata.side == "SELL" && orderbook.asks.length == 0){
            orderbook.asks.push(orderdata);
        }
        else if(orderdata.side == "SELL" && orderbook.asks.length > 0){
            let i = 0;
            while(i<orderbook.bids.length&&orderbook.asks[i].price <= orderdata.price)i++;
            orderbook.asks.splice(i,0,orderdata);
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
                    const tradePrice = orderbook.asks[i].price;
                    fills.push({
                        orderId : order.orderID,
                        filledQuantity : filledQuantity,
                        price : tradePrice
                    })
                     sendToWS(wsConnectionInstance,tradePrice.toString(),"ticker");
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
                    const tradePrice = orderbook.bids[i].price;
                     fills.push({
                        orderId : order.orderID,
                        filledQuantity : filledQuantity,
                       price : tradePrice
                    })
                    sendToWS(wsConnectionInstance,tradePrice.toString(),"ticker");
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
function generateResponse(fills:fill[],orderdata:any){
    let executedQuantity  = 0;
    for(let i = 0 ;i < fills.length; i++){
        executedQuantity += fills[i].filledQuantity;
    }
    console.log("quantity",orderdata.quantity)
    const remainingQuantity = orderdata.quantity - executedQuantity;
    
    const responseObject : responseObject= {
        orderId : orderdata.orderID,
        symbol : orderdata.symbol,
        executedQuantity : executedQuantity,
        remainingQuantity : remainingQuantity,
        fills : fills,
    }
    return responseObject;
}
pickUpOrder();
