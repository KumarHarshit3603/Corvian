export default function OrderBookRow({ row, side }) {
  const isAsk = side === "ask";
  const price = Number(row.price);
  const amount = Number(row.amount ?? row.quantity);
  const total = Number(row.total);
  const format = (value, digits = 4) => Number.isFinite(value)
    ? value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  return (
    <div className="relative grid grid-cols-3 px-3 py-[5.5px] text-[12.5px] tabular-nums">
      {/* depth bar */}
      <span
        className={`absolute inset-y-0 right-0 ${isAsk ? "bg-down/15" : "bg-up/15"}`}
        style={{ width: `${row.depth * 100}%` }}
      />
      <span className={`relative ${isAsk ? "text-down" : "text-up"}`}>{format(price, 2)}</span>
      <span className="relative text-right text-slate-200">{format(amount)}</span>
      <span className="relative text-right text-slate-200">{format(total, 2)}</span>
    </div>
  );
}
