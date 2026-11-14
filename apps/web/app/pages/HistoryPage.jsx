import { useState } from "react";
import { Download, Search } from "lucide-react";
import {
  ActivityTable,
  Notice,
  PageFrame,
  Panel,
  Stat,
  useNotice,
  activity,
} from "./shared/ExchangeUi";

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [notice, notify] = useNotice();
  const rows = activity.filter((row) =>
    `${row.type} ${row.pair} ${row.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <PageFrame
      title="Activity"
      description="Your recent trades, deposits, and withdrawals"
    >
      <Notice message={notice} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Trades this month" value="28" note="Across 8 markets" />
        <Stat label="Total traded" value="$24,681.32" note="Spot volume" />
        <Stat label="Deposits & withdrawals" value="12" note="All completed" />
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-2">
            <button className="rounded-lg bg-surface px-3 py-2 text-xs font-medium text-brand">
              All activity
            </button>
            <button className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-white">
              Trades
            </button>
            <button className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-white">
              Transfers
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-bg px-3">
              <Search size={14} className="text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter activity"
                className="w-36 bg-transparent text-xs outline-none placeholder:text-muted"
              />
            </label>
            <button
              onClick={() => notify("Activity export prepared.")}
              className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs text-slate-300 hover:bg-surface"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <ActivityTable rows={rows} />
      </Panel>
    </PageFrame>
  );
}
