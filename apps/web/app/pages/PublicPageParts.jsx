import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Logo from "../components/layout/Logo";
import CoinIcon from "../components/common/CoinIcon";
import { watchlist } from "../data/mock";

function PublicNav({ onNavigate }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-line px-5 sm:px-8 lg:px-14">
      <button onClick={() => onNavigate("landing")}>
        <Logo />
      </button>
      <nav className="hidden items-center gap-7 md:flex">
        <button
          onClick={() => onNavigate("currencies")}
          className="text-sm text-slate-300 hover:text-white"
        >
          Currencies
        </button>
        <button
          onClick={() => onNavigate("markets")}
          className="text-sm text-slate-300 hover:text-white"
        >
          Markets
        </button>
        <button
          onClick={() => onNavigate("earn")}
          className="text-sm text-slate-300 hover:text-white"
        >
          Earn
        </button>
      </nav>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("signin")}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-surface"
        >
          Log in
        </button>
        <button
          onClick={() => onNavigate("signup")}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-[#17120d] hover:bg-orange-400"
        >
          Create account
        </button>
      </div>
    </header>
  );
}

export function LandingPageContent({ onNavigate }) {
  return (
    <div className="min-h-screen bg-bg">
      <PublicNav onNavigate={onNavigate} />
      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:px-14 lg:pb-24">
          <div className="pointer-events-none absolute -right-28 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-[120px]" />
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand">
                <Sparkles size={13} /> A clearer way to trade digital assets
              </div>
              <h1 className="max-w-[700px] text-5xl font-semibold leading-[1.08] tracking-[-.045em] text-white sm:text-6xl lg:text-[72px]">
                Make your next move{" "}
                <span className="text-brand">with confidence.</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-base leading-7 text-muted sm:text-lg">
                Discover markets, trade with precision, and manage your
                portfolio from one powerful exchange.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate("signup")}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-[#17120d] hover:bg-orange-400"
                >
                  Start trading <ArrowRight size={17} />
                </button>
                <button
                  onClick={() => onNavigate("markets")}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-line bg-panel px-5 text-sm font-semibold text-white hover:border-brand/40"
                >
                  Explore markets <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-up" /> Spot markets
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-up" /> Portfolio tools
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-up" /> Flexible earn
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[480px]">
              <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-brand/15 via-transparent to-violet-500/10 blur-xl" />
              <div className="relative rounded-2xl border border-line bg-panel p-5 shadow-2xl shadow-black/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted">BTC / USDT</div>
                    <div className="mt-2 text-3xl font-semibold text-white">
                      $67,432.21
                    </div>
                    <div className="mt-1 text-xs text-up">
                      +2.36% <span className="text-muted">past 24 hours</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-up/10 px-2.5 py-1.5 text-xs font-medium text-up">
                    ● Market open
                  </div>
                </div>
                <div className="mt-6 h-[190px] overflow-hidden rounded-xl border border-line bg-bg p-3">
                  <svg
                    viewBox="0 0 500 170"
                    preserveAspectRatio="none"
                    className="h-full w-full"
                  >
                    <defs>
                      <linearGradient
                        id="marketFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0"
                          stopColor="#f59a3d"
                          stopOpacity=".26"
                        />
                        <stop offset="1" stopColor="#f59a3d" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 135 C22 126 30 133 47 116 S72 110 88 119 S111 103 130 108 S152 75 174 91 S193 99 210 76 S234 84 249 66 S270 82 287 60 S309 70 328 48 S352 62 367 41 S391 58 410 36 S432 48 450 25 S478 31 500 14 V170 H0Z"
                      fill="url(#marketFill)"
                    />
                    <path
                      d="M0 135 C22 126 30 133 47 116 S72 110 88 119 S111 103 130 108 S152 75 174 91 S193 99 210 76 S234 84 249 66 S270 82 287 60 S309 70 328 48 S352 62 367 41 S391 58 410 36 S432 48 450 25 S478 31 500 14"
                      fill="none"
                      stroke="#f59a3d"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["24h high", "$68,210"],
                    ["24h low", "$65,102"],
                    ["Volume", "$850.3M"],
                  ].map(([a, b]) => (
                    <div key={a}>
                      <div className="text-[10px] text-muted">{a}</div>
                      <div className="mt-1 text-xs font-medium text-white">
                        {b}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-5 -left-6 hidden items-center gap-3 rounded-xl border border-line bg-[#131922] p-3 shadow-xl sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-up/10">
                  <ShieldCheck size={18} className="text-up" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">
                    Security-first design
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted">
                    Tools to help protect your account
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-line bg-panel/50 px-5 py-7 sm:px-8 lg:px-14">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              ["$2.48T", "Total crypto market cap"],
              ["$84.6B", "24h global volume"],
              ["350+", "Markets to explore"],
              ["24/7", "Always-on markets"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-xl font-semibold text-white">{v}</div>
                <div className="mt-1 text-xs text-muted">{l}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                In the market
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Popular currencies
              </h2>
            </div>
            <button
              onClick={() => onNavigate("currencies")}
              className="text-sm font-medium text-brand"
            >
              View all <ChevronRight size={15} className="inline" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {watchlist.slice(0, 4).map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => onNavigate("trade")}
                className="flex items-center gap-3 rounded-xl border border-line bg-panel p-4 text-left hover:border-brand/40"
              >
                <CoinIcon symbol={coin.symbol} color={coin.color} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">{coin.symbol}</div>
                  <div className="text-xs text-muted">{coin.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{coin.price}</div>
                  <div
                    className={`mt-1 text-xs ${coin.change < 0 ? "text-down" : "text-up"}`}
                  >
                    {coin.change > 0 ? "+" : ""}
                    {coin.change}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
        <footer className="border-t border-line px-5 py-6 text-center text-xs text-muted">
          © 2026 Corvian Exchange · Digital assets involve risk.
        </footer>
      </main>
    </div>
  );
}

export function AuthPageContent({ mode, onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const signup = mode === "signup";
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <PublicNav onNavigate={onNavigate} />
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
              <LockKeyhole size={21} className="text-brand" />
            </div>
            <h1 className="text-3xl font-semibold text-white">
              {signup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {signup
                ? "Get started with your Corvian account."
                : "Sign in to continue to your exchange account."}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="rounded-2xl border border-line bg-panel p-6 sm:p-8"
          >
            {signup && (
              <label className="mb-4 block text-xs font-medium text-slate-300">
                Full name
                <input
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="mt-2 h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm text-white outline-none placeholder:text-muted focus:border-brand"
                />
              </label>
            )}
            <label className="mb-4 block text-xs font-medium text-slate-300">
              Email address
              <span className="relative mt-2 block">
                <Mail
                  size={16}
                  className="absolute left-3 top-3.5 text-muted"
                />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-line bg-bg pl-10 pr-3 text-sm text-white outline-none placeholder:text-muted focus:border-brand"
                />
              </span>
            </label>
            <label className="mb-2 block text-xs font-medium text-slate-300">
              Password
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder={
                  signup ? "At least 8 characters" : "Enter your password"
                }
                className="mt-2 h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm text-white outline-none placeholder:text-muted focus:border-brand"
              />
            </label>
            <div className="mb-5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="accent-[#f59a3d]"
                />{" "}
                Show password
              </label>
              {!signup && (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="text-brand hover:text-orange-300"
                >
                  Forgot password?
                </button>
              )}
            </div>
            {signup && (
              <label className="mb-5 flex items-start gap-2 text-xs leading-5 text-muted">
                <input
                  required
                  type="checkbox"
                  className="mt-1 accent-[#f59a3d]"
                />
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="text-brand"
                >
                  Terms of Service
                </button>{" "}
                and acknowledge the privacy notice.
              </label>
            )}
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-[#17120d] hover:bg-orange-400">
              {signup ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </button>
            {submitted && (
              <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 p-3 text-xs text-brand">
                Demo form submitted. Connect an authentication service to enable
                accounts.
              </div>
            )}
            <div className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted">
              <span className="h-px flex-1 bg-line" />
              Secure access
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck size={14} className="text-up" /> Your data is
              protected with encryption.
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {signup ? "Already have an account?" : "New to Corvian?"}{" "}
            <button
              onClick={() => onNavigate(signup ? "signin" : "signup")}
              className="font-medium text-brand hover:text-orange-300"
            >
              {signup ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
