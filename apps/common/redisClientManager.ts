import {createClient , RedisClientType} from 'redis'

const PORT = 6379;
export class RedisQueueClient{
    private static instance : RedisQueueClient | null = null;
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null = null;

    private constructor(RedisUrl:string){
        this.client = createClient({
            url: RedisUrl
        })
    }
    public static getInstance(RedisUrl:string):RedisQueueClient{
        if(!RedisQueueClient.instance){
            RedisQueueClient.instance = new RedisQueueClient(RedisUrl);
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

    private constructor(RedisUrl:string){
         this.client = createClient({
            url: RedisUrl
        })

    }
    public static getInstance(RedisUrl:string):RedisPubSubClient{
        if(!RedisPubSubClient.instance){
            RedisPubSubClient.instance = new RedisPubSubClient(RedisUrl);
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
    public async  subscribeToBroker(topic:string ){
       await this.client.subscribe(topic,(status)=>{
            console.log(status);
        });
    }
    public async unsubscribeToBroker(topic:string){
        await this.client.unsubscribe(topic);
    }
    public async publishToBroker(topic:string,status: string){
        await this.client.publish(topic,status)
        console.log("published to pubsub")
    }
}