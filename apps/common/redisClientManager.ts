import {createClient , RedisClientType} from 'redis'

const PORT = 6379;
export class singletonRedisClient{
    private static instance : singletonRedisClient | null = null;
    public client : RedisClientType;
    public connection : Promise<RedisClientType> | null = null;

    private constructor(){
        this.client = createClient({
            url: `redis://localhost:${PORT}`
        })
    }
    public static getInstance():singletonRedisClient{
        if(!singletonRedisClient.instance){
            singletonRedisClient.instance = new singletonRedisClient();
        }
        return singletonRedisClient.instance;
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

}