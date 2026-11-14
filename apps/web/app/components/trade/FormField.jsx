import { ChevronUp, ChevronDown } from "lucide-react";

export default function FormField({ label, value, onChange, placeholder, readOnly, spinner, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[12.5px] text-slate-300">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-[46px] w-full rounded-lg border border-line bg-surface px-3.5 text-[14px] text-white outline-none placeholder:text-muted focus:border-brand/60"
        />
        {spinner && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col text-slate-400">
            <ChevronUp size={12} /><ChevronDown size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
