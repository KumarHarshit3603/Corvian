import { ChevronDown } from "lucide-react";
import CoinIcon from "../common/CoinIcon";
import { pairStats as s } from "../../data/mock";

function Stat({ label, value, valueClass = "text-white" }) {
  return (
    <div className="leading-tight">
      <div className="text-[11.5px] text-muted">{label}</div>
      <div className={`mt-1.5 text-[14px] font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

export default function PairHeader() {
  return (
    <div className="flex items-center gap-10 rounded-xl border border-line bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <CoinIcon symbol="B" color="#f7931a" size={40} />
        <div className="leading-tight">
          <button className="flex items-center gap-2 text-[16px] font-semibold text-white">
            {s.pair} <ChevronDown size={14} className="text-muted" />
          </button>
          <div className="mt-0.5 text-[12px] text-muted">{s.coin}</div>
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-[22px] font-semibold text-white">{s.price}</div>
        <div className="mt-0.5 text-[11.5px] text-muted">{s.priceUsd}</div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-6 pr-4">
        <Stat label="24h Change" value={`+${s.change.toFixed(2)}%`} valueClass="text-up" />
        <Stat label="24h High" value={s.high} />
        <Stat label="24h Low" value={s.low} />
        <Stat label="24h Volume (BTC)" value={s.volBtc} />
        <Stat label="24h Volume (USDT)" value={s.volUsdt} />
      </div>
    </div>
  );
}
