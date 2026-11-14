import { recentTrades } from "../../data/mock";

export default function RecentTrades() {
  return (
    <section className="rounded-xl border border-line bg-panel p-3.5">
      <h3 className="mb-3 text-[14px] font-semibold text-white">Recent Trades</h3>
      <div className="grid grid-cols-3 pb-2 text-[11px] text-muted">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex flex-col gap-[7px] text-[12.5px] tabular-nums">
        {recentTrades.map((t, i) => (
          <div key={i} className="grid grid-cols-3">
            <span className={t.side === "buy" ? "text-up" : "text-down"}>{t.price}</span>
            <span className="text-right text-slate-200">{t.amount}</span>
            <span className="text-right text-slate-300">{t.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
