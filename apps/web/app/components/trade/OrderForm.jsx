import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import Tabs from "../common/Tabs";
import BuySellToggle from "./BuySellToggle";
import FormField from "./FormField";
import PercentSlider from "./PercentSlider";

const AVAILABLE_USDT = 1234.56;

export default function OrderForm({ ticker }) {
  const [market, setMarket] = useState("Spot");
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("Limit");
  const [price, setPrice] = useState("67432.21");
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const displayedPrice = orderType === "Market" && ticker?.price ? String(ticker.price) : price;
  const maxBuy = AVAILABLE_USDT / (Number(displayedPrice) || 1);
  const total = useMemo(() => (Number(displayedPrice) * Number(amount) || 0).toFixed(2), [displayedPrice, amount]);

  const onPercent = (value) => {
    setPercent(value);
    setAmount(((maxBuy * value) / 100).toFixed(4));
  };

  async function submitOrder() {
    const quantity = Number(amount);
    const orderPrice = Number(displayedPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(orderPrice) || orderPrice <= 0) {
      setFeedback("Enter a valid price and amount.");
      return;
    }

    setSubmitting(true);
    setFeedback("");
    try {
      const response = await fetch("/api/v1/orders/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          symbol: "BTCUSDT",
          side: side.toUpperCase(),
          type: orderType === "Market" ? "MARKET" : "LIMIT",
          price: String(orderPrice),
          quantity: String(quantity),
          ...(orderType === "Market" ? { kind: "ioc" } : {}),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not submit order.");

      setFeedback("Order queued. Recent trades update when it matches.");
      setAmount("");
      setPercent(0);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not submit order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-3.5">
      <Tabs tabs={["Spot", "Margin"]} active={market} onChange={setMarket} gap="gap-7" className="border-b border-line" />

      <div className="mt-4"><BuySellToggle side={side} onChange={setSide} /></div>

      <div className="mt-4 flex items-center gap-6 border-b border-line">
        {["Limit", "Market"].map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`relative pb-2.5 text-[13px] font-medium ${orderType === type ? "text-white" : "text-muted"}`}
          >
            {type}
            {orderType === type && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <FormField label="Price (USDT)" value={displayedPrice} onChange={setPrice} spinner readOnly={orderType === "Market"} />
        <div>
          <FormField label="Amount (BTC)" value={amount} onChange={setAmount} placeholder="Min 0.0001" />
          <PercentSlider value={percent} onChange={onPercent} />
        </div>
        <FormField label="Total (USDT)" value={total === "0.00" ? "" : total} placeholder="0.00" readOnly />
      </div>

      <button
        onClick={submitOrder}
        disabled={submitting || !amount || Number(amount) <= 0}
        className={`mt-5 h-11 w-full rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${side === "buy" ? "bg-up" : "bg-down"}`}
      >
        {submitting ? "Submitting..." : `${side === "buy" ? "Buy" : "Sell"} BTC`}
      </button>
      {feedback && <p className={`mt-2 text-xs ${feedback.startsWith("Could not") || feedback.startsWith("Enter") ? "text-down" : "text-muted"}`}>{feedback}</p>}

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
