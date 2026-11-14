import {createClient , RedisClientType} from 'redis'

export class RedisQueueClient{
    private static instances : Map<string,RedisQueueClient> = new Map<string,RedisQueueClient>();
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null = null;

    private constructor(RedisUrl:string){
        this.client = createClient({
            url: RedisUrl
        })
        this.client.on("error", (error) => console.error("Redis queue client error", error));
    }
    public static getInstance(RedisUrl:string):RedisQueueClient{
        if(!RedisQueueClient.instances.has(RedisUrl)){
            const newInstance = new RedisQueueClient(RedisUrl);
            RedisQueueClient.instances.set(RedisUrl,newInstance);
        }
        //@ts-ignore
        return RedisQueueClient.instances.get(RedisUrl);
    }
    public connectToClient(): Promise<RedisClientType> {
        if (!this.connection) {
            this.connection = this.client.connect().catch((error) => {
                this.connection = null;
                throw error;
            });
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
    private subscriber : RedisClientType;
    public connection : Promise<RedisClientType> | null  = null;
    private subscriberConnection: Promise<RedisClientType> | null = null;
    private subscribedTopics = new Set<string>();
    private topicHandlers = new Map<string, Set<(message: string) => void>>();
    
    private constructor(RedisUrl:string){
         this.client = createClient({
            url: RedisUrl
        })
        this.subscriber = this.client.duplicate();
        this.client.on("error", (error) => console.error("Redis pub/sub client error", error));
        this.subscriber.on("error", (error) => console.error("Redis subscriber client error", error));

    }
    public static getInstance(RedisUrl:string):RedisPubSubClient{
        if(!RedisPubSubClient.instances.has(RedisUrl)){
            const newInstance = new RedisPubSubClient(RedisUrl);
            RedisPubSubClient.instances.set(RedisUrl,newInstance);
        }
        //@ts-ignore
        return RedisPubSubClient.instances.get(RedisUrl);
    }
    public connectToClient(): Promise<RedisClientType> {
        if (!this.connection) {
            this.connection = this.client.connect().catch((error) => {
                this.connection = null;
                throw error;
            });
        }
        return this.connection;
    }
    public async subscribeToBroker(topic: string, handler?: (message: string) => void) {
        if (handler) {
            const handlers = this.topicHandlers.get(topic) ?? new Set();
            handlers.add(handler);
            this.topicHandlers.set(topic, handlers);
        }
        if (this.subscribedTopics.has(topic)) return;

        try {
            if (!this.subscriberConnection) {
                this.subscriberConnection = this.subscriber.connect().catch((error) => {
                    this.subscriberConnection = null;
                    throw error;
                });
            }
            await this.subscriberConnection;
            await this.subscriber.subscribe(topic, (message) => {
                for (const topicHandler of this.topicHandlers.get(topic) ?? []) {
                    topicHandler(message);
                }
            });
            this.subscribedTopics.add(topic);
        } catch (error) {
            this.topicHandlers.delete(topic);
            throw error;
        }
    }
    public async unsubscribeToBroker(topic:string){
        this.topicHandlers.delete(topic);
        if (!this.subscribedTopics.has(topic)) return;
        await this.subscriber.unsubscribe(topic);
        this.subscribedTopics.delete(topic);
    }
    public async publishToBroker(topic:string,status: string){
       return await this.client.publish(topic,status)
        // console.log("published to pubsub")
    }
}
