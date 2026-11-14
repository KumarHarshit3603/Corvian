import { ohlc } from "../../data/mock";

/** Overlay shown at the top-left inside the chart area */
export default function ChartLegend({ pair = "BTC/USDT", timeframe = "1h", exchange = "Binance" }) {
  return (
    <div className="pointer-events-none absolute left-3 top-2.5 z-10 flex items-center gap-4 text-[11.5px]">
      <span className="font-medium text-slate-200">{pair} · {timeframe} · {exchange}</span>
      <span className="text-up">
        <span className="text-slate-300">O </span>{ohlc.o}
        <span className="ml-2 text-slate-300">H </span>{ohlc.h}
        <span className="ml-2 text-slate-300">L </span>{ohlc.l}
        <span className="ml-2 text-slate-300">C </span>{ohlc.c}
        <span className="ml-2">{ohlc.chg}</span>
      </span>
    </div>
  );
}
