import { useMemo, useState } from "react";
import { ChevronDown, PlusCircle } from "lucide-react";
import Tabs from "../common/Tabs";
import BuySellToggle from "./BuySellToggle";
import FormField from "./FormField";
import PercentSlider from "./PercentSlider";

const AVAILABLE_USDT = 1234.56;

export default function OrderForm() {
  const [market, setMarket] = useState("Spot");
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("Limit");
  const [price, setPrice] = useState("67432.21");
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState(0);

  const maxBuy = AVAILABLE_USDT / (Number(price) || 1);
  const total = useMemo(() => (Number(price) * Number(amount) || 0).toFixed(2), [price, amount]);

  const onPercent = (p) => {
    setPercent(p);
    setAmount(((maxBuy * p) / 100).toFixed(4));
  };

  return (
    <section className="rounded-xl border border-line bg-panel p-3.5">
      <Tabs tabs={["Spot", "Margin"]} active={market} onChange={setMarket} gap="gap-7" className="border-b border-line" />

      <div className="mt-4"><BuySellToggle side={side} onChange={setSide} /></div>

      {/* order type */}
      <div className="mt-4 flex items-center gap-6 border-b border-line">
        {["Limit", "Market"].map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`relative pb-2.5 text-[13px] font-medium ${orderType === t ? "text-white" : "text-muted"}`}
          >
            {t}
            {orderType === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />}
          </button>
        ))}
        <button
          onClick={() => setOrderType("Stop-limit")}
          className={`relative flex items-center gap-1 pb-2.5 text-[13px] font-medium ${orderType === "Stop-limit" ? "text-white" : "text-muted"}`}
        >
          Stop-limit <ChevronDown size={13} />
          {orderType === "Stop-limit" && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <FormField label="Price (USDT)" value={price} onChange={setPrice} spinner readOnly={orderType === "Market"} />
        <div>
          <FormField label="Amount (BTC)" value={amount} onChange={setAmount} placeholder="Min 0.0001" />
          <PercentSlider value={percent} onChange={onPercent} />
        </div>
        <FormField label="Total (USDT)" value={total === "0.00" ? "" : total} placeholder="0.00" readOnly />
      </div>

      <button
        className={`mt-5 h-11 w-full rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90 ${
          side === "buy" ? "bg-up" : "bg-down"
        }`}
      >
        {side === "buy" ? "Buy" : "Sell"} BTC
      </button>

      <dl className="mt-4 space-y-2.5 text-[12px]">
        <div className="flex items-center justify-between">
          <dt className="text-slate-300">Available</dt>
          <dd className="flex items-center gap-1.5 text-white">
            {AVAILABLE_USDT.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT
            <PlusCircle size={14} className="text-up" />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-300">Max Buy</dt>
          <dd className="text-white">{maxBuy.toFixed(4)} BTC</dd>
        </div>
      </dl>
    </section>
  );
}
