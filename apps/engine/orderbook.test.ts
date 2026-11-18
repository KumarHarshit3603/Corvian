import { describe, expect, it } from "vitest";
import {
  addToOrderbook,
  createOrderbook,
  matchOrder,
  normalizeSymbol,
  shouldRestOrder,
  type order,
} from "./orderbook";
import { calculateBalanceDelta, validateOrder } from "./tradingRules";

function makeOrder(overrides: Partial<order> = {}): order {
  return {
    orderId: "order-1",
    symbol: "BTCUSDT",
    side: "BUY",
    type: "LIMIT",
    price: 100,
    quantity: 1,
    ...overrides,
  };
}

describe("engine orderbook", () => {
  it("normalizes BASE/QUOTE symbols for internal routing", () => {
    expect(normalizeSymbol("sol/usdt")).toBe("SOLUSDT");
  });

  it("keeps bids highest first and asks lowest first", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "bid-low", price: 98 }));
    addToOrderbook(book, makeOrder({ orderId: "bid-high", price: 99 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-high", side: "SELL", price: 102 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-low", side: "SELL", price: 101 }));

    expect(book.bids.map(({ price }) => price)).toEqual([99, 98]);
    expect(book.asks.map(({ price }) => price)).toEqual([101, 102]);
  });

  it("matches a limit buy against the best eligible asks and leaves the remainder", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask-101", side: "SELL", price: 101, quantity: 2 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-102", side: "SELL", price: 102, quantity: 3 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-103", side: "SELL", price: 103, quantity: 5 }));
    const incoming = makeOrder({ orderId: "buyer", side: "BUY", price: 102, quantity: 4 });

    const fills = matchOrder(book, incoming);

    expect(fills).toEqual([
      { orderId: "buyer", filledQuantity: 2, price: 101 },
      { orderId: "buyer", filledQuantity: 2, price: 102 },
    ]);
    expect(incoming.quantity).toBe(0);
    expect(book.asks).toEqual([
      makeOrder({ orderId: "ask-102", side: "SELL", price: 102, quantity: 1 }),
      makeOrder({ orderId: "ask-103", side: "SELL", price: 103, quantity: 5 }),
    ]);
  });

  it("does not match a limit order past its limit price", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask", side: "SELL", price: 101, quantity: 2 }));
    const incoming = makeOrder({ orderId: "buyer", side: "BUY", price: 100, quantity: 1 });

    expect(matchOrder(book, incoming)).toEqual([]);
    expect(incoming.quantity).toBe(1);
    expect(book.asks[0].quantity).toBe(2);
  });

  it("lets a market sell sweep bids at their resting prices", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "bid-99", price: 99, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "bid-98", price: 98, quantity: 2 }));
    const incoming = makeOrder({ orderId: "seller", side: "SELL", type: "MARKET", price: 0, quantity: 2.5 });

    const fills = matchOrder(book, incoming);

    expect(fills).toEqual([
      { orderId: "seller", filledQuantity: 1, price: 99 },
      { orderId: "seller", filledQuantity: 1.5, price: 98 },
    ]);
    expect(incoming.quantity).toBe(0);
    expect(book.bids).toEqual([makeOrder({ orderId: "bid-98", price: 98, quantity: 0.5 })]);
  });

  it("matches at the exact limit price", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask", side: "SELL", price: 100, quantity: 1 }));
    const incoming = makeOrder({ orderId: "buyer", price: 100, quantity: 1 });

    expect(matchOrder(book, incoming)).toEqual([
      { orderId: "buyer", filledQuantity: 1, price: 100 },
    ]);
    expect(book.asks).toHaveLength(0);
  });

  it("matches limit sells only against bids at or above the limit", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "bid-102", price: 102, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "bid-100", price: 100, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "bid-99", price: 99, quantity: 1 }));
    const incoming = makeOrder({ orderId: "seller", side: "SELL", price: 100, quantity: 3 });

    expect(matchOrder(book, incoming)).toEqual([
      { orderId: "seller", filledQuantity: 1, price: 102 },
      { orderId: "seller", filledQuantity: 1, price: 100 },
    ]);
    expect(incoming.quantity).toBe(1);
    expect(book.bids.map(({ price }) => price)).toEqual([99]);
  });

  it("preserves FIFO priority for orders at the same price", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "first", side: "SELL", price: 101, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "second", side: "SELL", price: 101, quantity: 1 }));
    const incoming = makeOrder({ orderId: "buyer", price: 101, quantity: 1.5 });

    expect(matchOrder(book, incoming)).toEqual([
      { orderId: "buyer", filledQuantity: 1, price: 101 },
      { orderId: "buyer", filledQuantity: 0.5, price: 101 },
    ]);
    expect(book.asks).toEqual([
      makeOrder({ orderId: "second", side: "SELL", price: 101, quantity: 0.5 }),
    ]);
  });

  it("keeps the unfilled incoming quantity when resting liquidity is insufficient", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask", side: "SELL", price: 100, quantity: 2 }));
    const incoming = makeOrder({ orderId: "buyer", price: 100, quantity: 5 });

    expect(matchOrder(book, incoming)).toEqual([
      { orderId: "buyer", filledQuantity: 2, price: 100 },
    ]);
    expect(incoming.quantity).toBe(3);
    expect(book.asks).toHaveLength(0);
  });

  it("does nothing when a market order reaches an empty opposite side", () => {
    const book = createOrderbook();
    const incoming = makeOrder({ orderId: "buyer", type: "MARKET", quantity: 2 });

    expect(matchOrder(book, incoming)).toEqual([]);
    expect(incoming.quantity).toBe(2);
    expect(book).toEqual({ asks: [], bids: [] });
  });

  it("does not mutate the book or incoming order for zero quantity", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask", side: "SELL", price: 100, quantity: 2 }));
    const incoming = makeOrder({ orderId: "buyer", price: 100, quantity: 0 });

    expect(matchOrder(book, incoming)).toEqual([]);
    expect(incoming.quantity).toBe(0);
    expect(book.asks[0].quantity).toBe(2);
  });

  it("does not cross or alter the same-side book", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "bid", price: 100, quantity: 2 }));
    const incoming = makeOrder({ orderId: "new-bid", price: 101, quantity: 1 });

    expect(matchOrder(book, incoming)).toEqual([]);
    expect(book.bids).toEqual([makeOrder({ orderId: "bid", price: 100, quantity: 2 })]);
  });

  it("removes fully consumed levels without skipping the next order", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask-1", side: "SELL", price: 100, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-2", side: "SELL", price: 101, quantity: 1 }));
    addToOrderbook(book, makeOrder({ orderId: "ask-3", side: "SELL", price: 102, quantity: 1 }));
    const incoming = makeOrder({ orderId: "buyer", price: 102, quantity: 3 });

    expect(matchOrder(book, incoming)).toHaveLength(3);
    expect(incoming.quantity).toBe(0);
    expect(book.asks).toEqual([]);
  });

  it("does not rest market, IOC, or fully filled orders", () => {
    expect(shouldRestOrder(makeOrder({ type: "MARKET" }), 1)).toBe(false);
    expect(shouldRestOrder(makeOrder({ kind: "ioc" }), 1)).toBe(false);
    expect(shouldRestOrder(makeOrder(), 0)).toBe(false);
  });

  it("rests an unfilled limit order with remaining quantity", () => {
    expect(shouldRestOrder(makeOrder(), 0.25)).toBe(true);
  });

  it("partially fills an IOC limit order without resting its remainder", () => {
    const book = createOrderbook();
    addToOrderbook(book, makeOrder({ orderId: "ask", side: "SELL", price: 100, quantity: 1 }));
    const incoming = makeOrder({ orderId: "ioc-buyer", price: 100, quantity: 2, kind: "ioc" });

    const fills = matchOrder(book, incoming);
    if (shouldRestOrder(incoming, incoming.quantity)) addToOrderbook(book, incoming);

    expect(fills).toEqual([{ orderId: "ioc-buyer", filledQuantity: 1, price: 100 }]);
    expect(incoming.quantity).toBe(1);
    expect(book.bids).toEqual([]);
  });
});

describe("engine order validation", () => {
  const validInput = {
    orderID: "order-1",
    symbol: "SOL/USDT",
    side: "BUY",
    type: "LIMIT",
    price: "162.50",
    quantity: "2.25",
  };

  it("normalizes the pair and parses string amounts", () => {
    expect(validateOrder(validInput)).toEqual({
      order: {
        orderId: "order-1",
        symbol: "SOLUSDT",
        side: "BUY",
        type: "LIMIT",
        price: 162.5,
        quantity: 2.25,
      },
      requestedQuantity: 2.25,
    });
  });

  it("rejects null, arrays, and primitive payloads", () => {
    expect(validateOrder(null)).toEqual({ error: "Order must be an object." });
    expect(validateOrder([])).toEqual({ error: "Order must be an object." });
    expect(validateOrder("order")).toEqual({ error: "Order must be an object." });
  });

  it("requires a non-empty order ID and a usable currency symbol", () => {
    expect(validateOrder({ ...validInput, orderID: " " })).toEqual({ error: "Order ID must be a non-empty string." });
    expect(validateOrder({ ...validInput, symbol: "///" })).toEqual({ error: "Symbol must contain a base and quote currency." });
  });

  it("rejects unsupported sides and order types", () => {
    expect(validateOrder({ ...validInput, side: "HOLD" })).toEqual({ error: "Side must be BUY or SELL." });
    expect(validateOrder({ ...validInput, type: "STOP" })).toEqual({ error: "Type must be MARKET or LIMIT." });
  });

  it("requires a positive finite price for limit orders", () => {
    expect(validateOrder({ ...validInput, price: "0" })).toEqual({ error: "Limit price must be a positive number." });
    expect(validateOrder({ ...validInput, price: "NaN" })).toEqual({ error: "Limit price must be a positive number." });
  });

  it("requires a finite price for market orders but permits zero", () => {
    expect(validateOrder({ ...validInput, type: "MARKET", price: "0" })).toMatchObject({
      order: { type: "MARKET", price: 0 },
    });
    expect(validateOrder({ ...validInput, type: "MARKET", price: "Infinity" })).toEqual({ error: "Price must be a finite number." });
    expect(validateOrder({ ...validInput, type: "MARKET", price: null })).toEqual({ error: "Price must be a finite number." });
    expect(validateOrder({ ...validInput, type: "MARKET", price: " " })).toEqual({ error: "Price must be a finite number." });
  });

  it("rejects zero, negative, non-numeric, and infinite quantities", () => {
    for (const quantity of ["0", "-1", "nope", "Infinity"]) {
      expect(validateOrder({ ...validInput, quantity })).toEqual({ error: "Quantity must be a positive finite number." });
    }
  });

  it("accepts IOC and null kinds but rejects unknown kinds", () => {
    expect(validateOrder({ ...validInput, kind: "ioc" })).toMatchObject({ order: { kind: "ioc" } });
    expect(validateOrder({ ...validInput, kind: null })).toMatchObject({ order: { kind: null } });
    expect(validateOrder({ ...validInput, kind: "fok" })).toEqual({ error: "Order kind must be ioc when provided." });
  });
});

describe("fill balance calculations", () => {
  const fills = [
    { orderId: "order-1", filledQuantity: 2, price: 100 },
    { orderId: "order-1", filledQuantity: 1, price: 110 },
  ];

  it("debits quote and credits base for buy fills", () => {
    expect(calculateBalanceDelta("BUY", fills)).toEqual({ baseDelta: 3, quoteDelta: -310 });
  });

  it("debits base and credits quote for sell fills", () => {
    expect(calculateBalanceDelta("SELL", fills)).toEqual({ baseDelta: -3, quoteDelta: 310 });
  });

  it("returns zero deltas when there are no fills", () => {
    expect(calculateBalanceDelta("BUY", [])).toEqual({ baseDelta: 0, quoteDelta: 0 });
    expect(calculateBalanceDelta("SELL", [])).toEqual({ baseDelta: 0, quoteDelta: 0 });
  });
});
