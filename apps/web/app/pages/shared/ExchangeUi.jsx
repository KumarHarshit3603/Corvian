import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import CoinIcon from "../../components/common/CoinIcon";
import { watchlist, orders } from "../../data/mock";

export const holdings = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: "0.8421",
    value: "$56,774.45",
    change: "+2.36%",
    color: "#f7931a",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: "4.2500",
    value: "$10,510.01",
    change: "+3.12%",
    color: "#627eea",
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: "28.400",
    value: "$4,613.58",
    change: "+1.87%",
    color: "#14f195",
  },
  {
    symbol: "USDT",
    name: "Tether",
    amount: "8,420.00",
    value: "$8,420.00",
    change: "0.01%",
    color: "#26a17b",
  },
  {
    symbol: "BNB",
    name: "BNB",
    amount: "4.800",
    value: "$2,804.73",
    change: "+0.95%",
    color: "#f3ba2f",
  },
];
export const products = [
  {
    name: "USDT Flexible",
    asset: "USDT",
    apy: "5.80%",
    term: "Flexible",
    min: "1 USDT",
    color: "#26a17b",
  },
  {
    name: "ETH Staking",
    asset: "ETH",
    apy: "4.25%",
    term: "Flexible",
    min: "0.01 ETH",
    color: "#627eea",
  },
  {
    name: "BTC Vault",
    asset: "BTC",
    apy: "3.20%",
    term: "30 days",
    min: "0.001 BTC",
    color: "#f7931a",
  },
];
export const activity = [
  {
    type: "Buy",
    pair: "BTC/USDT",
    date: "Nov 12, 2026 · 14:32",
    amount: "0.0120 BTC",
    total: "$808.91",
    status: "Filled",
  },
  {
    type: "Sell",
    pair: "ETH/USDT",
    date: "Nov 12, 2026 · 10:18",
    amount: "0.5000 ETH",
    total: "$1,236.59",
    status: "Filled",
  },
  {
    type: "Deposit",
    pair: "USDT",
    date: "Nov 11, 2026 · 18:04",
    amount: "2,500.00 USDT",
    total: "$2,500.00",
    status: "Completed",
  },
  ...orders.map((o) => ({
    type: o.side,
    pair: o.pair,
    date: o.date,
    amount: `${o.amount} ${o.pair.split("/")[0]}`,
    total: `$${o.total}`,
    status: o.status,
  })),
];

export function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-line bg-panel ${className}`}>
      {children}
    </section>
  );
}
export function PageTitle({
  eyebrow = "CORVIAN EXCHANGE",
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-brand">
          {eyebrow}
        </div>
        <h1 className="text-[27px] font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Button({ children, secondary = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${secondary ? "border border-line bg-surface text-white hover:border-brand/50" : "bg-brand text-[#17120d] hover:bg-orange-400"}`}
    >
      {children}
    </button>
  );
}
export function Stat({ label, value, note, positive = true }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-[23px] font-semibold tracking-tight text-white">
        {value}
      </div>
      {note && (
        <div className={`mt-1 text-xs ${positive ? "text-up" : "text-muted"}`}>
          {note}
        </div>
      )}
    </div>
  );
}
export function CoinRows({ rows = holdings, compact = false, onTrade }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">Asset</th>
            <th className="px-5 py-3 text-right font-medium">Price</th>
            <th className="px-5 py-3 text-right font-medium">24h change</th>
            <th className="px-5 py-3 text-right font-medium">
              {compact ? "Market cap" : "Balance"}
            </th>
            <th className="px-5 py-3 text-right font-medium">
              {compact ? "24h volume" : "Value"}
            </th>
            <th className="px-5 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((coin) => {
            const market = compact
              ? watchlist.find((c) => c.symbol === coin.symbol) || coin
              : null;
            return (
              <tr
                key={coin.symbol}
                className="border-b border-line/70 last:border-0 hover:bg-white/[.02]"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={coin.symbol} color={coin.color} />
                    <div>
                      <div className="font-semibold text-white">
                        {coin.name}
                      </div>
                      <div className="text-xs text-muted">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-white">
                  {market?.price ||
                    {
                      BTC: "$67,432.21",
                      ETH: "$2,473.18",
                      SOL: "$162.45",
                      USDT: "$1.00",
                      BNB: "$584.32",
                    }[coin.symbol]}
                </td>
                <td
                  className={`px-5 py-3.5 text-right ${(market?.change ?? 2) < 0 ? "text-down" : "text-up"}`}
                >
                  {market
                    ? `${market.change > 0 ? "+" : ""}${market.change.toFixed(2)}%`
                    : coin.change}
                </td>
                <td className="px-5 py-3.5 text-right text-white">
                  {compact
                    ? market?.name === "Bitcoin"
                      ? "$1.33T"
                      : market?.name === "Ethereum"
                        ? "$297.5B"
                        : "$72.4B"
                    : coin.amount}
                </td>
                <td className="px-5 py-3.5 text-right font-medium text-white">
                  {compact
                    ? market?.name === "Bitcoin"
                      ? "$38.2B"
                      : "$14.6B"
                    : coin.value}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onTrade?.(coin.symbol)}
                    className="text-xs font-semibold text-brand hover:text-orange-300"
                  >
                    {compact ? "Trade" : "Manage"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export function ActivityTable({ rows = activity }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
            {["Type", "Market", "Date & time", "Amount", "Total", "Status"].map(
              (x) => (
                <th key={x} className="px-5 py-3 font-medium">
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.pair}-${i}`}
              className="border-b border-line/70 last:border-0"
            >
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center gap-2 ${row.type === "Buy" ? "text-up" : row.type === "Sell" ? "text-down" : "text-slate-200"}`}
                >
                  {row.type === "Buy" ? (
                    <ArrowDownLeft size={14} />
                  ) : row.type === "Sell" ? (
                    <ArrowUpRight size={14} />
                  ) : null}
                  {row.type}
                </span>
              </td>
              <td className="px-5 py-4 font-medium text-white">{row.pair}</td>
              <td className="px-5 py-4 text-muted">{row.date}</td>
              <td className="px-5 py-4 text-white">{row.amount}</td>
              <td className="px-5 py-4 text-white">{row.total}</td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] ${["Filled", "Completed"].includes(row.status) ? "bg-up/10 text-up" : row.status === "Open" ? "bg-brand/10 text-brand" : "bg-surface text-muted"}`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function PageFrame({ title, description, children, action }) {
  return (
    <div className="mx-auto max-w-[1440px] p-5 lg:p-8">
      <PageTitle title={title} description={description} action={action} />
      {children}
    </div>
  );
}
export function Notice({ message }) {
  return message ? (
    <div className="fixed right-6 top-[76px] z-50 rounded-lg border border-brand/30 bg-panel px-4 py-3 text-sm text-white shadow-xl">
      {message}
    </div>
  ) : null;
}
export function useNotice() {
  const [notice, setNotice] = useState("");
  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  return [notice, notify];
}
