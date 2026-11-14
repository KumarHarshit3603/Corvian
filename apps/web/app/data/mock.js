export const navLinks = ["Home", "Trade", "Markets", "Currencies", "Earn", "More"];

export const sidebarLinks = [
  { id: "home", label: "Overview", icon: "Home" },
  { id: "trade", label: "Trade", icon: "CandlestickChart" },
  { id: "markets", label: "Markets", icon: "BarChart3" },
  { id: "currencies", label: "Currencies", icon: "Coins" },
  { id: "earn", label: "Earn", icon: "PiggyBank" },
  { id: "wallet", label: "Wallet", icon: "Wallet" },
  { id: "history", label: "History", icon: "History" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export const watchlist = [
  { symbol: "BTC", name: "Bitcoin", price: "$67,432.21", change: 2.36, color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", price: "$2,473.18", change: 1.42, color: "#627eea" },
  { symbol: "SOL", name: "Solana", price: "$162.45", change: 4.18, color: "#14f195" },
  { symbol: "BNB", name: "BNB", price: "$584.32", change: -0.72, color: "#f3ba2f" },
  { symbol: "USDT", name: "Tether", price: "$1.00", change: 0.01, color: "#26a17b" },
  { symbol: "XRP", name: "XRP", price: "$0.62", change: -1.15, color: "#5b6dee" },
  { symbol: "ADA", name: "Cardano", price: "$0.48", change: 0.84, color: "#3468d4" },
  { symbol: "DOGE", name: "Dogecoin", price: "$0.16", change: 3.26, color: "#c2a633" },
];

export const timeframes = ["15m", "1h", "4h", "1D", "1W"];
export const ohlc = { o: "66,845.12", h: "67,910.00", l: "66,210.44", c: "67,432.21", chg: "+0.88%" };
export const pairStats = {
  pair: "BTC/USDT", coin: "Bitcoin / Tether", price: "67,432.21", priceUsd: "$67,432.21",
  change: 2.36, high: "68,120.00", low: "65,890.12", volBtc: "18,245.67", volUsdt: "1.23B",
};

export const asks = [
  { price: "67,440.12", amount: "0.842", total: "56,805.38", depth: 0.46 },
  { price: "67,438.50", amount: "1.205", total: "81,313.39", depth: 0.68 },
  { price: "67,436.00", amount: "0.534", total: "36,077.82", depth: 0.34 },
  { price: "67,434.72", amount: "2.140", total: "144,310.30", depth: 0.86 },
  { price: "67,433.80", amount: "0.716", total: "48,276.20", depth: 0.52 },
];
export const bids = [
  { price: "67,432.21", amount: "1.184", total: "79,919.74", depth: 0.72 },
  { price: "67,430.00", amount: "0.628", total: "42,366.04", depth: 0.43 },
  { price: "67,428.55", amount: "1.756", total: "118,394.13", depth: 0.81 },
  { price: "67,426.10", amount: "0.395", total: "26,633.92", depth: 0.29 },
  { price: "67,424.00", amount: "2.018", total: "136,021.63", depth: 0.92 },
];
export const recentTrades = [
  { price: "67,432.21", amount: "0.0241", time: "14:32:08", side: "buy" },
  { price: "67,431.80", amount: "0.1084", time: "14:32:06", side: "sell" },
  { price: "67,433.12", amount: "0.0520", time: "14:32:03", side: "buy" },
  { price: "67,430.44", amount: "0.0168", time: "14:31:59", side: "sell" },
  { price: "67,432.00", amount: "0.0912", time: "14:31:54", side: "buy" },
];
export const orderTabs = ["Open Orders", "Order History", "Trade History"];
export const orders = [
  { date: "2026-11-12 14:32", pair: "BTC/USDT", type: "Limit", side: "Buy", price: "65,800.00", amount: "0.042", filled: "0.000", total: "2,763.60", status: "Open" },
  { date: "2026-11-12 11:18", pair: "ETH/USDT", type: "Limit", side: "Sell", price: "2,510.00", amount: "0.800", filled: "0.800", total: "2,008.00", status: "Filled" },
  { date: "2026-11-11 09:42", pair: "SOL/USDT", type: "Market", side: "Buy", price: "158.20", amount: "5.000", filled: "5.000", total: "791.00", status: "Filled" },
  { date: "2026-11-10 16:05", pair: "BTC/USDT", type: "Limit", side: "Sell", price: "69,200.00", amount: "0.015", filled: "0.000", total: "1,038.00", status: "Open" },
  { date: "2026-11-09 10:21", pair: "ETH/USDT", type: "Limit", side: "Buy", price: "2,380.00", amount: "1.000", filled: "0.000", total: "2,380.00", status: "Canceled" },
];
