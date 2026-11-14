import SidebarNav from "./SidebarNav";
import Watchlist from "./Watchlist";
import EarnBanner from "./EarnBanner";
export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="flex w-[272px] shrink-0 flex-col border-r border-line bg-bg">
      <SidebarNav active={active} onNavigate={onNavigate} />
      <div className="border-t border-line" />
      <Watchlist />
    </aside>
  );
}
