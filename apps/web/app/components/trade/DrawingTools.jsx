import {
  Crosshair, TrendingUp, Waypoints, PenLine, Type, Share2, AlignJustify, Diamond, Ruler, ZoomIn, Magnet, Plus,
} from "lucide-react";

const tools = [
  { id: "cross", icon: Crosshair },
  { id: "trend", icon: TrendingUp },
  { id: "channel", icon: Waypoints },
  { id: "brush", icon: PenLine },
  { id: "text", icon: Type },
  { id: "pattern", icon: Share2 },
  { id: "fib", icon: AlignJustify },
  { id: "shape", icon: Diamond },
  { id: "ruler", icon: Ruler },
  { id: "zoom", icon: ZoomIn },
];

export default function DrawingTools({ active, onSelect }) {
  return (
    <div className="flex w-[57px] shrink-0 flex-col items-center gap-1 border-r border-line py-3">
      {tools.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect?.(id)}
          className={`rounded-md p-2 transition-colors hover:bg-surface hover:text-white ${
            active === id ? "bg-surface text-white" : "text-slate-300"
          }`}
        >
          <Icon size={19} strokeWidth={1.6} />
        </button>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button className="rounded-md p-2 text-slate-300 hover:bg-surface"><Magnet size={19} strokeWidth={1.6} /></button>
        <button className="rounded-md p-2 text-slate-300 hover:bg-surface"><Plus size={19} strokeWidth={1.6} /></button>
      </div>
    </div>
  );
}
