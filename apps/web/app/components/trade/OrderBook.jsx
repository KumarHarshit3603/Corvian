import { useState } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";
import Tabs from "../common/Tabs";
import OrderBookRow from "./OrderBookRow";
import RatioBar from "./RatioBar";
import { asks, bids, pairStats } from "../../data/mock";

export default function OrderBook() {
  const [tab, setTab] = useState("Order Book");

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-3.5 pt-3.5">
        <Tabs tabs={["Order Book", "Recent Trades"]} active={tab} onChange={setTab} gap="gap-5" />
      </div>

      <div className="flex justify-end px-3.5 pt-2.5">
        <button className="flex w-[78px] items-center justify-between rounded-md bg-surface px-2.5 py-1 text-[11.5px] text-slate-200">
          0.01 <ChevronDown size={13} className="text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-3 px-3 pb-2 pt-2.5 text-[11px] text-muted">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Total (USDT)</span>
      </div>

      <div>{asks.map((r) => <OrderBookRow key={r.price} row={r} side="ask" />)}</div>

      <div className="flex items-baseline gap-2.5 px-3 py-3.5">
        <span className="flex items-center gap-1 text-[22px] font-semibold text-up">
          {pairStats.price} <ArrowUp size={16} />
        </span>
        <span className="text-[11px] text-muted">{pairStats.priceUsd}</span>
      </div>

      <div>{bids.map((r) => <OrderBookRow key={r.price} row={r} side="bid" />)}</div>

      <RatioBar buy={52} sell={48} />
    </section>
  );
}
