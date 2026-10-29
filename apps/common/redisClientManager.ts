import {createClient , RedisClientType} from 'redis'

export class RedisQueueClient{
    private static instances : Map<string,RedisQueueClient> = new Map<string,RedisQueueClient>();
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null = null;

    private constructor(RedisUrl:string){
        this.client = createClient({
            url: RedisUrl
        })
    }
    public static getInstance(RedisUrl:string):RedisQueueClient{
        if(!RedisQueueClient.instances.has(RedisUrl)){
            const newInstance = new RedisQueueClient(RedisUrl);
            RedisQueueClient.instances.set(RedisUrl,newInstance);
        }
        //@ts-ignore
        return RedisQueueClient.instances.get(RedisUrl);
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
    private static instances : Map<string,RedisPubSubClient> = new Map<string,RedisPubSubClient>(); ;
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null  = null;

    private constructor(RedisUrl:string){
         this.client = createClient({
            url: RedisUrl
        })

    }
    public static getInstance(RedisUrl:string):RedisPubSubClient{
        if(!RedisPubSubClient.instances.has(RedisUrl)){
            const newInstance = new RedisPubSubClient(RedisUrl);
            RedisPubSubClient.instances.set(RedisUrl,newInstance);
        }
        //@ts-ignore
        return RedisPubSubClient.instances.get(RedisUrl);
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