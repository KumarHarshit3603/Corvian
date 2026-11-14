interface order{
    orderId : string,
    symbol: string,
    type: "MARKET" | 'LIMIT',
    price: number,
    quantity: number,
    kind : "ioc" | null
}
interface bid extends order{
    side : "BUY"
}
interface ask extends order{
    side : "SELL"
}
export interface orderbook{
    asks: ask[],
    bids: bid[]
}

const orderbooks = new Map<string, orderbook>();

export function getOrderbook(symbol: string): orderbook {
    let book = orderbooks.get(symbol);
    if (!book) {
        book = { asks: [], bids: [] };
        orderbooks.set(symbol, book);
    }
    return book;
}

export interface fill{
    orderId : string,
    filledQuantity : number,
    price : number
}

export interface responseObject {
    orderId : string , 
    symbol : string ,
    executedQuantity : number,
    remainingQuantity : number,
    fills : fill[]
}
