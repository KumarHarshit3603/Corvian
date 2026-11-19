import { useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import Logo from "./Logo";
import { navLinks, watchlist } from "../../data/mock";

const pageByLink = {
  Home: "landing",
  Trade: "trade",
  Markets: "markets",
  Currencies: "currencies",
  Earn: "earn",
  Wallet: "wallet",
  More: "history",
};

export default function Navbar({ active = "trade", onNavigate, user, onSignOut }) {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? watchlist.filter(({ symbol, name }) => `${symbol} ${name}`.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <header className="flex h-[60px] shrink-0 items-center border-b border-line bg-bg px-6">
      <button onClick={() => onNavigate?.("landing")} aria-label="Corvian home">
        <Logo />
      </button>

      <nav className="ml-8 flex h-full items-center gap-4 xl:ml-12 xl:gap-6">
        {navLinks.map((link) => (
          <button
            key={link}
            onClick={() => onNavigate?.(pageByLink[link] || "trade")}
            className={`relative flex h-full items-center gap-1 text-[13px] font-medium transition-colors xl:text-sm ${
              active === (pageByLink[link] || "trade")
                ? "text-brand"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {link}
            {link === "More" && <ChevronDown size={14} />}
            {active === (pageByLink[link] || "trade") && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
            )}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <div className="relative flex h-10 w-[278px] items-center gap-2.5 rounded-xl bg-surface px-3.5">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results.length) {
                onNavigate?.("currencies", results[0].symbol);
                setQuery("");
              }
              if (event.key === "Escape") setQuery("");
            }}
            aria-label="Search currencies"
            aria-expanded={results.length > 0}
            placeholder="Search coins, pairs, or symbols..."
            className="w-full bg-transparent text-[12px] text-slate-200 outline-none placeholder:text-muted"
          />
          {query.trim() && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-panel shadow-xl">
              {results.length ? results.slice(0, 6).map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => {
                    onNavigate?.("currencies", coin.symbol);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface"
                >
                  <span className="text-sm font-medium text-white">{coin.name}</span>
                  <span className="text-xs text-muted">{coin.symbol}</span>
                </button>
              )) : <div className="px-4 py-3 text-xs text-muted">No currencies found</div>}
            </div>
          )}
        </div>
        <button className="text-slate-300 hover:text-white">
          <Bell size={19} />
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-[12px] font-semibold text-white">
              {(user.name || user.email || "U")
                .split(/[\s.@_-]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
            <span className="hidden max-w-36 truncate text-xs text-slate-200 sm:block">{user.name || user.email}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-surface hover:text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate?.("signin")} className="text-xs text-slate-300 hover:text-white">Log in</button>
            <button onClick={() => onNavigate?.("signup")} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-[#17120d]">Sign up</button>
          </div>
        )}
      </div>
    </header>
  );
}
