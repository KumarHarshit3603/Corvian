import { useRef } from "react";
import ChartToolbar from "./ChartToolbar";
import ChartLegend from "./ChartLegend";
import TradingChart from "./TradingChart";

export default function ChartPanel({ pair = "BTC/USDT", timeframe, onTimeframeChange, candle, candles }) {
  const panelRef = useRef(null);

  const enterFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      panelRef.current?.requestFullscreen?.();
    }
  };

  return (
    <section
      ref={panelRef}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-panel [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none"
    >
      <ChartToolbar timeframe={timeframe} onTimeframeChange={onTimeframeChange} onFullscreen={enterFullscreen} />
      <div className="relative min-h-0 flex-1">
        <ChartLegend pair={pair} timeframe={timeframe} candle={candle} />
        <TradingChart pair={pair} timeframe={timeframe} candle={candle} candles={candles} />
      </div>
    </section>
  );
}
