export default function BuySellToggle({ side, onChange }) {
  const base = "h-10 flex-1 rounded-md text-[14px] font-semibold transition-colors";
  return (
    <div className="flex gap-1.5 rounded-lg bg-surface p-0.5">
      <button onClick={() => onChange("buy")} className={`${base} ${side === "buy" ? "bg-up text-white" : "text-slate-300"}`}>
        Buy
      </button>
      <button onClick={() => onChange("sell")} className={`${base} ${side === "sell" ? "bg-down text-white" : "text-slate-300"}`}>
        Sell
      </button>
    </div>
  );
}
