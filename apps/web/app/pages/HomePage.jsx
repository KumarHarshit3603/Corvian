import { ArrowRight, TrendingUp } from "lucide-react";
import CoinIcon from "../components/common/CoinIcon";
import { watchlist } from "../data/mock";
import {
  ActivityTable,
  CoinRows,
  holdings,
  PageFrame,
  Panel,
  Stat,
  activity,
} from "./shared/ExchangeUi";

function Sparkline({ down = false }) {
  const points = down
    ? "0,14 10,9 20,16 30,12 40,19 50,15 60,22 70,17 80,24 90,21 100,27"
    : "0,25 10,20 20,23 30,11 40,17 50,10 60,16 70,6 80,12 90,4 100,8";
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-24">
      <polyline
        fill="none"
        stroke={down ? "#f2465a" : "#1fc58f"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export default function HomePage({ onNavigate }) {
  return (
    <PageFrame title="Overview" description="Your portfolio, at a glance">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total portfolio value"
          value="$83,122.77"
          note="↑ $2,184.32 (2.70%) today"
        />
        <Stat
          label="24h trading volume"
          value="$12,840.56"
          note="Across 6 trades today"
        />
        <Stat
          label="Available balance"
          value="$8,420.00"
          note="USDT · ready to trade"
        />
        <Stat label="Rewards earned" value="$284.16" note="Lifetime earnings" />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Your assets</h2>
              <p className="mt-1 text-xs text-muted">
                Portfolio balance by asset
              </p>
            </div>
            <button
              onClick={() => onNavigate("wallet")}
              className="text-xs font-semibold text-brand"
            >
              View wallet <ArrowRight className="ml-1 inline" size={13} />
            </button>
          </div>
          <CoinRows
            rows={holdings.slice(0, 4)}
            onTrade={() => onNavigate("trade")}
          />
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Market overview</h2>
              <p className="mt-1 text-xs text-muted">Top assets · 24h</p>
            </div>
            <TrendingUp size={17} className="text-brand" />
          </div>
          <div className="mt-4 space-y-1">
            {watchlist.slice(0, 4).map((coin) => (
              <button
                onClick={() => onNavigate("trade")}
                key={coin.symbol}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-surface"
              >
                <CoinIcon symbol={coin.symbol} color={coin.color} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {coin.symbol}
                  </div>
                  <div className="text-xs text-muted">{coin.price}</div>
                </div>
                <Sparkline down={coin.change < 0} />
                <span
                  className={`w-14 text-right text-xs ${coin.change < 0 ? "text-down" : "text-up"}`}
                >
                  {coin.change > 0 ? "+" : ""}
                  {coin.change.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Recent activity</h2>
            <p className="mt-1 text-xs text-muted">Latest account movements</p>
          </div>
          <button
            onClick={() => onNavigate("history")}
            className="text-xs font-semibold text-brand"
          >
            See all <ArrowRight className="ml-1 inline" size={13} />
          </button>
        </div>
        <ActivityTable rows={activity.slice(0, 4)} />
      </Panel>
    </PageFrame>
  );
}
