export default function RatioBar({ buy = 50, sell = 50 }) {
  return (
    <div className="mt-auto flex items-center gap-2.5 px-3 pb-3 pt-3 text-[12px] font-medium">
      <span className="text-up">B {buy}%</span>
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full">
        <div className="bg-up" style={{ width: `${buy}%` }} />
        <div className="bg-down" style={{ width: `${sell}%` }} />
      </div>
      <span className="text-down">{sell}% S</span>
    </div>
  );
}
