import { useRef, useState } from "react";
import ChartToolbar from "./ChartToolbar";
import ChartLegend from "./ChartLegend";
import TradingChart from "./TradingChart";

export default function ChartPanel({ chartContainerRef }) {
  const [timeframe, setTimeframe] = useState("1h");
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
      className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-panel [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none"
    >
      <ChartToolbar timeframe={timeframe} onTimeframeChange={setTimeframe} onFullscreen={enterFullscreen} />
      <div className="relative min-h-0 flex-1">
        <ChartLegend timeframe={timeframe} />
        <TradingChart chartContainerRef={chartContainerRef} />
      </div>
    </section>
  );
}
