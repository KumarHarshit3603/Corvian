import { useState } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";
import Tabs from "../common/Tabs";
import OrderBookRow from "./OrderBookRow";
import RatioBar from "./RatioBar";

const format = (value, digits = 2) => Number(value).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

export default function OrderBook({ pair = "BTC/USDT", orderbook, depth, trades = [], status }) {
  const [baseCurrency, quoteCurrency] = pair.split("/");
  const [tab, setTab] = useState("Order Book");
  const asks = orderbook?.asks ?? [];
  const bids = orderbook?.bids ?? [];
  const bidQuantity = depth?.bidQuantity ?? bids.reduce((sum, level) => sum + Number(level.quantity ?? level.amount), 0);
  const askQuantity = depth?.askQuantity ?? asks.reduce((sum, level) => sum + Number(level.quantity ?? level.amount), 0);
  const totalDepth = bidQuantity + askQuantity;
  const buyPercent = totalDepth ? Math.round((bidQuantity / totalDepth) * 100) : 50;
  const lastPrice = bids[0]?.price ?? asks[0]?.price;

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
        <span>Price ({quoteCurrency})</span>
        <span className="text-right">Amount ({baseCurrency})</span>
        <span className="text-right">Total ({quoteCurrency})</span>
      </div>

      {tab === "Order Book" ? (
        <>
          <div className="flex-1 overflow-y-auto">
            {asks.length ? [...asks].reverse().map((row) => <OrderBookRow key={row.price} row={row} side="ask" />) : null}
          </div>
          <div className="flex items-baseline gap-2.5 px-3 py-3.5">
            <span className="flex items-center gap-1 text-[22px] font-semibold text-up">
              {lastPrice === undefined ? "—" : format(lastPrice)} <ArrowUp size={16} />
            </span>
            <span className="text-[11px] text-muted">{status === "connected" ? "Live" : "Connecting…"}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {bids.length ? bids.map((row) => <OrderBookRow key={row.price} row={row} side="bid" />) : null}
          </div>
          {!orderbook && <p className="px-3 py-2 text-center text-xs text-muted">Waiting for the first market update</p>}
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 text-xs">
          {trades.slice(0, 8).map((trade) => (
            <div key={trade.id ?? `${trade.timestamp}-${trade.price}`} className="grid grid-cols-3 py-1.5 tabular-nums">
              <span className={trade.side === "buy" ? "text-up" : "text-down"}>{format(trade.price)}</span>
              <span className="text-right text-slate-200">{Number(trade.amount).toFixed(4)}</span>
              <span className="text-right text-muted">{new Date(trade.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {!trades.length && <p className="py-2 text-center text-muted">Waiting for matched trades</p>}
        </div>
      )}

      <RatioBar buy={buyPercent} sell={100 - buyPercent} />
    </section>
  );
}
