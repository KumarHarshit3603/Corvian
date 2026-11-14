const steps = [25, 50, 75, 100];

export default function PercentSlider({ value, onChange }) {
  return (
    <div>
      <div className="relative mt-4 flex items-center justify-between px-0.5">
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-line" />
        <div className="absolute left-1 top-1/2 h-px -translate-y-1/2 bg-up" style={{ width: `${value}%` }} />
        {[0, ...steps].map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`relative z-10 h-2.5 w-2.5 rounded-full border ${
              value >= s ? "border-up bg-up" : "border-slate-600 bg-panel"
            }`}
          />
        ))}
      </div>
      <div className="mt-3.5 grid grid-cols-4 gap-2">
        {steps.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="rounded-md bg-surface py-1.5 text-[12px] text-slate-200 hover:bg-[#1e2430]"
          >
            {s}%
          </button>
        ))}
      </div>
    </div>
  );
}
