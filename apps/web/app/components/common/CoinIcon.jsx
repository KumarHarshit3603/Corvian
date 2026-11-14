export default function CoinIcon({ symbol, color, size = 32 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {symbol.slice(0, 1)}
    </span>
  );
}
