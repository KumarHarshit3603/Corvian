import { normalizeSymbol, type fill, type order } from "./orderbook";

type RawOrder = Record<string, unknown>;

export type ValidatedOrder = {
  order: order;
  requestedQuantity: number;
} | {
  error: string;
};

export function validateOrder(value: unknown): ValidatedOrder {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Order must be an object." };
  }

  const rawOrder = value as RawOrder;
  const orderId = rawOrder.orderID;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return { error: "Order ID must be a non-empty string." };
  }

  const symbol = typeof rawOrder.symbol === "string" ? normalizeSymbol(rawOrder.symbol) : "";
  if (!symbol) return { error: "Symbol must contain a base and quote currency." };

  const { side, type } = rawOrder;
  if (side !== "BUY" && side !== "SELL") return { error: "Side must be BUY or SELL." };
  if (type !== "MARKET" && type !== "LIMIT") return { error: "Type must be MARKET or LIMIT." };

  const rawPrice = rawOrder.price;
  if ((typeof rawPrice !== "string" && typeof rawPrice !== "number") ||
      (typeof rawPrice === "string" && !rawPrice.trim())) {
    return { error: "Price must be a finite number." };
  }
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || (type === "LIMIT" && price <= 0)) {
    return { error: type === "LIMIT" ? "Limit price must be a positive number." : "Price must be a finite number." };
  }

  const requestedQuantity = Number(rawOrder.quantity);
  if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
    return { error: "Quantity must be a positive finite number." };
  }

  const kind = rawOrder.kind;
  if (kind !== undefined && kind !== null && kind !== "ioc") {
    return { error: "Order kind must be ioc when provided." };
  }

  return {
    order: {
      orderId,
      symbol,
      side,
      type,
      price,
      quantity: requestedQuantity,
      ...(kind === undefined ? {} : { kind }),
    },
    requestedQuantity,
  };
}

export type BalanceDelta = { baseDelta: number; quoteDelta: number };

export function calculateBalanceDelta(side: order["side"], fills: fill[]): BalanceDelta {
  const baseAmount = fills.reduce((total, fill) => total + fill.filledQuantity, 0);
  const quoteAmount = fills.reduce((total, fill) => total + fill.filledQuantity * fill.price, 0);
  const direction = side === "BUY" ? 1 : -1;
  const signedBaseAmount = baseAmount === 0 ? 0 : direction * baseAmount;
  const signedQuoteAmount = quoteAmount === 0 ? 0 : -direction * quoteAmount;

  return {
    baseDelta: signedBaseAmount,
    quoteDelta: signedQuoteAmount,
  };
}
