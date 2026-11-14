function formatPrice(value) {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RecentTrades({ trades = [], status }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-white">Recent Trades</h3>
        <span className="text-[10px] text-muted">{status === "connected" ? "LIVE" : status.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-3 pb-2 text-[11px] text-muted">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex flex-col gap-[7px] text-[12.5px] tabular-nums">
        {trades.slice(0, 5).map((trade) => (
          <div key={trade.id ?? `${trade.timestamp}-${trade.price}`} className="grid grid-cols-3">
            <span className={trade.side === "buy" ? "text-up" : "text-down"}>{formatPrice(trade.price)}</span>
            <span className="text-right text-slate-200">{Number(trade.amount).toFixed(4)}</span>
            <span className="text-right text-slate-300">{new Date(trade.timestamp ?? trade.time).toLocaleTimeString()}</span>
          </div>
        ))}
        {!trades.length && <p className="col-span-3 py-2 text-center text-xs text-muted">Waiting for matched trades</p>}
      </div>
    </section>
  );
}
