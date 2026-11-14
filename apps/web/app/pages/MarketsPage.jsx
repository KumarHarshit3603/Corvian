import { ArrowRight } from "lucide-react";
import { watchlist } from "../data/mock";
import { CoinRows, PageFrame, Panel, Stat } from "./shared/ExchangeUi";

export default function MarketsPage({ onNavigate }) {
  return (
    <PageFrame
      title="Markets"
      description="Explore the crypto market and find your next opportunity"
      action={
        <button
          onClick={() => onNavigate("trade")}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-[#17120d]"
        >
          Open terminal <ArrowRight size={15} />
        </button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Total market cap" value="$2.48T" note="↑ 2.14% in 24h" />
        <Stat label="24h volume" value="$84.62B" note="Across spot markets" />
        <Stat label="BTC dominance" value="53.8%" note="↑ 0.32% in 24h" />
      </div>
      <Panel className="overflow-hidden">
        <div className="border-b border-line p-4">
          <h2 className="text-sm font-semibold text-white">Top spot markets</h2>
          <p className="mt-1 text-xs text-muted">
            Prices and market activity over the past 24 hours
          </p>
        </div>
        <CoinRows
          rows={watchlist.slice(0, 8)}
          compact
          onTrade={() => onNavigate("trade")}
        />
      </Panel>
    </PageFrame>
  );
}
