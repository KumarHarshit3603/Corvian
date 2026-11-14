export default function OrderBookRow({ row, side }) {
  const isAsk = side === "ask";
  return (
    <div className="relative grid grid-cols-3 px-3 py-[5.5px] text-[12.5px] tabular-nums">
      {/* depth bar */}
      <span
        className={`absolute inset-y-0 right-0 ${isAsk ? "bg-down/15" : "bg-up/15"}`}
        style={{ width: `${row.depth * 100}%` }}
      />
      <span className={`relative ${isAsk ? "text-down" : "text-up"}`}>{row.price}</span>
      <span className="relative text-right text-slate-200">{row.amount}</span>
      <span className="relative text-right text-slate-200">{row.total}</span>
    </div>
  );
}
