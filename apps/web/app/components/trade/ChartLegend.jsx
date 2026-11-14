function formatPrice(value) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

export default function ChartLegend({ pair = "BTC/USDT", timeframe = "1h", exchange = "Corvian", candle }) {
  const change = candle ? candle.close - candle.open : 0;
  const changePercent = candle?.open ? (change / candle.open) * 100 : 0;
  return (
    <div className="pointer-events-none absolute left-3 top-2.5 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
      <span className="font-medium text-slate-200">{pair} · {timeframe} · {exchange}</span>
      <span className={change >= 0 ? "text-up" : "text-down"}>
        <span className="text-slate-300">O </span>{formatPrice(candle?.open)}
        <span className="ml-2 text-slate-300">H </span>{formatPrice(candle?.high)}
        <span className="ml-2 text-slate-300">L </span>{formatPrice(candle?.low)}
        <span className="ml-2 text-slate-300">C </span>{formatPrice(candle?.close)}
        <span className="ml-2">{candle ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "Waiting for trades"}</span>
      </span>
    </div>
  );
}
