interface order{
    orderId : string,
    symbol: string,
    type: "MARKET" | 'LIMIT',
    price: BigInt,
    quantity: number,
    kind : "ioc" | null
}
interface bid extends order{
    side : "BUY"
}
interface ask extends order{
    side : "SELL"
}
interface orderbook{
    asks: ask[],
    bids: bid[]
}
 
export const orderbook : orderbook = {
    asks : [],
    bids : []
}

export interface fill{
    orderId : string,
    filledQuantity : number,
    remainingQuantity : number
}

