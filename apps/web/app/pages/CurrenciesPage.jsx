import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { watchlist } from "../data/mock";
import { CoinRows, PageFrame, Panel, Stat } from "./shared/ExchangeUi";

export default function CurrenciesPage({ onNavigate }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") || "");
  }, []);
  const assets = watchlist.filter(({ symbol, name }) =>
    `${symbol} ${name}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <PageFrame
      title="Currencies"
      description="Browse supported digital assets and compare market data"
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Total market cap" value="$2.48T" note="↑ 2.14% in 24h" />
        <Stat label="24h volume" value="$84.62B" note="Across spot markets" />
        <Stat label="BTC dominance" value="53.8%" note="↑ 0.32% in 24h" />
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-2">
            <button className="rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-brand">
              All assets
            </button>
            <button className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-white">
              Favorites
            </button>
            <button className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-white">
              Gainers
            </button>
            <button className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-white">
              New listings
            </button>
          </div>
          <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-bg px-3">
            <Search size={14} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currencies"
              className="w-36 bg-transparent text-xs outline-none placeholder:text-muted"
            />
          </label>
        </div>
        <CoinRows rows={assets} compact onTrade={() => onNavigate("trade")} />
      </Panel>
    </PageFrame>
  );
}
