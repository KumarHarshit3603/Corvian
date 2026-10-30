import { connectToQueue ,sendOrderStatus} from "./getOrders";
import {connectToWS,sendToWS} from "./ws"


const orderQueueInstance = await connectToQueue();
const wsConnectionInstance = await connectToWS();

async function orderProcessing(){
    while(true){
        const data = await orderQueueInstance.getDataFromQueue();
        if(!data) {
            console.log("couldn't get data");
            continue;
        }
        console.log(data);
        await sendOrderStatus(data?.element);
        const success = await sendToWS(wsConnectionInstance,data.element,"demotopic");
        console.log(success);
    }
}
orderProcessing();
