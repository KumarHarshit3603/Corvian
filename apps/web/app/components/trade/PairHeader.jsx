import { ChevronDown } from "lucide-react";
import CoinIcon from "../common/CoinIcon";

const formatPrice = (value) => Number.isFinite(value)
  ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : "-";
const formatVolume = (value) => Number.isFinite(value)
  ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  : "-";

function Stat({ label, value, valueClass = "text-white" }) {
  return (
    <div className="leading-tight">
      <div className="text-[11.5px] text-muted">{label}</div>
      <div className={`mt-1.5 text-[14px] font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

const availablePairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];

export default function PairHeader({ pair = "BTC/USDT", onPairChange, ticker }) {
  const [baseCurrency, quoteCurrency] = pair.split("/");
  const statsWindow = ticker?.hasFull24h ? "24h" : "Session";
  return (
    <div className="flex items-center gap-10 rounded-xl border border-line bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <CoinIcon symbol="B" color="#f7931a" size={40} />
        <div className="leading-tight">
          <label className="relative flex items-center gap-2 text-[16px] font-semibold text-white">
            <select
              aria-label="Trading pair"
              className="appearance-none bg-transparent pr-5 outline-none"
              value={pair}
              onChange={(event) => onPairChange?.(event.target.value)}
            >
              {availablePairs.map((availablePair) => <option key={availablePair} value={availablePair} className="bg-panel">{availablePair}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-0 text-muted" />
          </label>
          <div className="mt-0.5 text-[12px] text-muted">{baseCurrency} / {quoteCurrency}</div>
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-[22px] font-semibold text-white">{formatPrice(ticker?.price)}</div>
        <div className="mt-0.5 text-[11.5px] text-muted">Live market price ({quoteCurrency})</div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-6 pr-4">
        <Stat label={`${statsWindow} Change`} value={ticker ? `${ticker.change24h >= 0 ? "+" : ""}${ticker.change24h.toFixed(2)}%` : "-"} valueClass={ticker?.change24h >= 0 ? "text-up" : "text-down"} />
        <Stat label={`${statsWindow} High`} value={formatPrice(ticker?.high24h)} />
        <Stat label={`${statsWindow} Low`} value={formatPrice(ticker?.low24h)} />
        <Stat label={`${statsWindow} Volume (${baseCurrency})`} value={formatVolume(ticker?.baseVolume24h)} />
        <Stat label={`${statsWindow} Volume (${quoteCurrency})`} value={formatVolume(ticker?.quoteVolume24h)} />
      </div>
    </div>
  );
}
