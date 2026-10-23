import {createClient , RedisClientType} from 'redis'

const PORT = 6379;
export class RedisQueueClient{
    private static instance : RedisQueueClient | null = null;
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null = null;

    private constructor(){
        this.client = createClient({
            url: `redis://localhost:${PORT}`
        })
    }
    public static getInstance():RedisQueueClient{
        if(!RedisQueueClient.instance){
            RedisQueueClient.instance = new RedisQueueClient();
        }
        return RedisQueueClient.instance;
    }
    public  connectToClient(): Promise<RedisClientType> | null{
        if(!this.client){
            console.log("client not created");
        }
        if(!this.connection){
            try{
                this.connection = this.client.connect();
            }
            catch(e){
                console.log(e);
                this.connection = null;
            }
        }

        return this.connection;
    }
    public async sendDataToQueue(data: any){
            return await  this.client.lPush("demodata",JSON.stringify(data));
    }
    public async getDataFromQueue(){
            return await this.client.brPop("demodata",0);
    }



}

export class RedisPubSubClient{
    private static instance : RedisPubSubClient;
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null  = null;

    private constructor(){
         this.client = createClient({
            url: `redis://localhost:${PORT}`
        })

    }
    public static getInstance():RedisPubSubClient{
        if(!RedisPubSubClient.instance){
            RedisPubSubClient.instance = new RedisPubSubClient();
        }
        return RedisPubSubClient.instance;
    }
    public connectToClient(){
        if(!this.client){
            console.log("client not created");
        }
        if(!this.connection){
          try{
              this.connection = this.client.connect()
          }
          catch(e){
                console.log(e);
                this.connection = null;
          }
        }
        return this.connection;
    }
    public async  subscribeToBroker(){
       await this.client.subscribe("orderStatus",(status)=>{
            console.log(status);
        });
    }
    public async unsubscribeToBroker(){
        await this.client.unsubscribe("orderStatus");
    }
    public async publishToBroker(status: string){
        await this.client.publish("orderStatus",status)
        console.log("published to pubsub")
    }
}