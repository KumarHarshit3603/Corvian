import {
  Home,
  CandlestickChart,
  BarChart3,
  PiggyBank,
  Wallet,
  History,
  Settings,
  Coins,
} from "lucide-react";
import { sidebarLinks } from "../../data/mock";

const icons = {
  Home,
  CandlestickChart,
  BarChart3,
  PiggyBank,
  Wallet,
  History,
  Settings,
  Coins,
};

export default function SidebarNav({ active = "trade", onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-3">
      {sidebarLinks.map(({ id, label, icon }) => {
        const Icon = icons[icon];
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate?.(id)}
            className={`flex h-[38px] items-center gap-3.5 rounded-lg px-3 text-[14px] font-medium transition-colors ${
              isActive
                ? "bg-[#201d1c] text-white"
                : "text-slate-300 hover:bg-surface"
            }`}
          >
            <Icon
              size={18}
              className={isActive ? "text-brand" : "text-slate-400"}
            />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
