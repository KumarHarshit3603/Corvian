export interface order {
    orderId : string,
    symbol: string,
    type: "MARKET" | 'LIMIT',
    price: number,
    quantity: number,
    kind?: "ioc" | null,
    side: "BUY" | "SELL",
}
export interface orderbook{
    asks: order[],
    bids: order[]
}

const orderbooks = new Map<string, orderbook>();

export function createOrderbook(): orderbook {
    return { asks: [], bids: [] };
}

export function getOrderbook(symbol: string): orderbook {
    let book = orderbooks.get(symbol);
    if (!book) {
        book = createOrderbook();
        orderbooks.set(symbol, book);
    }
    return book;
}

export function normalizeSymbol(symbol: string): string {
    return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function addToOrderbook(book: orderbook, incomingOrder: order, sort = true): void {
    const side = incomingOrder.side === "BUY" ? book.bids : book.asks;
    side.push(incomingOrder);
    if (sort) {
        side.sort((a, b) => incomingOrder.side === "BUY" ? b.price - a.price : a.price - b.price);
    }
}

export function matchOrder(book: orderbook, incomingOrder: order): fill[] {
    const fills: fill[] = [];
    const oppositeSide = incomingOrder.side === "BUY" ? book.asks : book.bids;
    let index = 0;

    while (index < oppositeSide.length && incomingOrder.quantity > 0) {
        const restingOrder = oppositeSide[index];
        const crosses = incomingOrder.type === "MARKET" || (incomingOrder.side === "BUY"
            ? restingOrder.price <= incomingOrder.price
            : restingOrder.price >= incomingOrder.price);
        if (!crosses) break;

        const filledQuantity = Math.min(restingOrder.quantity, incomingOrder.quantity);
        restingOrder.quantity -= filledQuantity;
        incomingOrder.quantity -= filledQuantity;
        fills.push({ orderId: incomingOrder.orderId, filledQuantity, price: restingOrder.price });

        if (restingOrder.quantity <= 0) oppositeSide.splice(index, 1);
        else index += 1;
    }

    return fills;
}

export function shouldRestOrder(incomingOrder: order, remainingQuantity: number): boolean {
    return incomingOrder.type === "LIMIT" && incomingOrder.kind !== "ioc" && remainingQuantity > 0;
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
    fills : fill[],
    balanceDelta: { baseDelta: number; quoteDelta: number },
}
