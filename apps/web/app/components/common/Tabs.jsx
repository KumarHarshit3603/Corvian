/**
 * Generic underline tabs.
 * tabs: string[]  |  active: string  |  onChange(tab)
 */
export default function Tabs({ tabs, active, onChange, className = "", gap = "gap-6", size = "text-[13px]" }) {
  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange?.(tab)}
            className={`relative pb-2.5 ${size} font-medium transition-colors ${
              isActive ? "text-white" : "text-muted hover:text-slate-200"
            }`}
          >
            {tab}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-brand" />}
          </button>
        );
      })}
    </div>
  );
}
