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

export const orderTabs = ["Open Orders", "Order History", "Trade History"];
export const orders = [
  { date: "2026-11-12 14:32", pair: "BTC/USDT", type: "Limit", side: "Buy", price: "65,800.00", amount: "0.042", filled: "0.000", total: "2,763.60", status: "Open" },
  { date: "2026-11-12 11:18", pair: "ETH/USDT", type: "Limit", side: "Sell", price: "2,510.00", amount: "0.800", filled: "0.800", total: "2,008.00", status: "Filled" },
  { date: "2026-11-11 09:42", pair: "SOL/USDT", type: "Market", side: "Buy", price: "158.20", amount: "5.000", filled: "5.000", total: "791.00", status: "Filled" },
  { date: "2026-11-10 16:05", pair: "BTC/USDT", type: "Limit", side: "Sell", price: "69,200.00", amount: "0.015", filled: "0.000", total: "1,038.00", status: "Open" },
  { date: "2026-11-09 10:21", pair: "ETH/USDT", type: "Limit", side: "Buy", price: "2,380.00", amount: "1.000", filled: "0.000", total: "2,380.00", status: "Canceled" },
];
