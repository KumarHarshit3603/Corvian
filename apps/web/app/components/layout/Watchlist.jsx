import { Plus } from "lucide-react";
import CoinIcon from "../common/CoinIcon";
import { watchlist } from "../../data/mock";

export default function Watchlist({ onSelect }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <h3 className="text-[16px] font-semibold text-white">Watchlist</h3>
        <button className="text-muted hover:text-white"><Plus size={18} /></button>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-2">
        {watchlist.map((c) => {
          const up = c.change >= 0;
          return (
            <li key={c.symbol}>
              <button
                onClick={() => onSelect?.(c.symbol)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-[7px] text-left hover:bg-surface"
              >
                <CoinIcon symbol={c.symbol} color={c.color} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[13px] font-semibold text-white">{c.symbol}</div>
                  <div className="text-[11px] text-muted">{c.name}</div>
                </div>
                <div className="text-right leading-tight">
                  <div className="text-[13px] font-medium text-white">{c.price}</div>
                  <div className={`text-[12px] ${up ? "text-up" : "text-down"}`}>
                    {up ? "+" : ""}{c.change.toFixed(2)}%
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
