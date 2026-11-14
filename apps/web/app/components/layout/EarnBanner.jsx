import { ArrowRight } from "lucide-react";

export default function EarnBanner() {
  return (
    <div className="m-3 flex gap-3 rounded-xl bg-gradient-to-br from-[#1d1535] to-[#261a47] p-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white">
        V
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-white">Earn rewards</div>
        <p className="mt-0.5 text-[10.5px] leading-snug text-slate-400">
          Stake your assets and earn up to 12% APY
        </p>
        <button className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-violet-500">
          Explore Earn <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
