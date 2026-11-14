import { Maximize2 } from "lucide-react";
import { timeframes } from "../../data/mock";

export default function ChartToolbar({ timeframe, onTimeframeChange, onFullscreen }) {
  return (
    <div className="flex h-[52px] items-center gap-1 border-b border-line px-3">
      {timeframes.map((tf) => (
        <button
          key={tf}
          onClick={() => onTimeframeChange?.(tf)}
          className={`rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
            timeframe === tf ? "bg-[#2a2119] text-brand" : "text-slate-300 hover:text-white"
          }`}
        >
          {tf}
        </button>
      ))}
      <button
        title="Fullscreen"
        onClick={onFullscreen}
        className="ml-auto rounded p-1.5 text-slate-300 hover:bg-surface hover:text-white"
      >
        <Maximize2 size={17} />
      </button>
    </div>
  );
}
