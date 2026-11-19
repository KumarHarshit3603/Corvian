export type TradeRecord = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  orderType: "MARKET" | "LIMIT";
  takerOrderId: string;
  makerOrderId: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  amount: number;
  quoteAmount: number;
  time: number;
  timestamp: number;
};

export const TRADE_HISTORY_QUEUE = "trade-history";
