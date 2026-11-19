"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const TradePage = lazy(() => import("./pages/TradePage"));
const MarketsPage = lazy(() => import("./pages/MarketsPage"));
const CurrenciesPage = lazy(() => import("./pages/CurrenciesPage"));
const EarnPage = lazy(() => import("./pages/EarnPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const pathByPage = {
  landing: "/",
  signin: "/signin",
  signup: "/signup",
  home: "/overview",
  trade: "/trade",
  markets: "/markets",
  currencies: "/currencies",
  earn: "/earn",
  wallet: "/wallet",
  history: "/history",
  settings: "/settings",
};
const pageByPath = Object.fromEntries(
  Object.entries(pathByPage).map(([page, path]) => [path, page]),
);
const getPage = (pathname) =>
  pageByPath[pathname.replace(/\/$/, "") || "/"] || "landing";
const pageComponents = {
  landing: LandingPage,
  signin: SignInPage,
  signup: SignUpPage,
  home: HomePage,
  trade: TradePage,
  markets: MarketsPage,
  currencies: CurrenciesPage,
  earn: EarnPage,
  wallet: WalletPage,
  history: HistoryPage,
  settings: SettingsPage,
};

function PageLoader() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-muted">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      Loading page…
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [routeKey, setRouteKey] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useCallback((nextPage, searchQuery = "") => {
    const path = pathByPage[nextPage] || "/";
    const url = new URL(path, window.location.origin);
    if (searchQuery) url.searchParams.set("q", searchQuery);
    window.history.pushState({}, "", `${url.pathname}${url.search}`);
    setPage(nextPage in pathByPage ? nextPage : "landing");
    setRouteKey(`${url.pathname}${url.search}`);
    window.scrollTo(0, 0);
  }, []);

  const handleAuthenticated = useCallback((authenticatedUser) => {
    setUser(authenticatedUser);
    navigate("home");
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/Auth/signout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) return;
      setUser(null);
      navigate("landing");
    } catch {
      // Keep the current client session if the server could not clear its cookie.
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/Auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      setPage(getPage(window.location.pathname));
      setRouteKey(window.location.pathname + window.location.search);
    };

    const handlePopState = () => {
      syncRoute();
    };

    syncRoute();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isPublic = ["landing", "signin", "signup"].includes(page);
  const requiresAuth = ["home", "trade", "wallet", "history", "settings"].includes(page);
  useEffect(() => {
    if (authReady && !user && requiresAuth) navigate("signin");
  }, [authReady, user, requiresAuth, navigate]);

  const Page = pageComponents[page] || LandingPage;
  const pageContent = (
    <Suspense key={`${page}:${routeKey}`} fallback={<PageLoader />}>
      <Page onNavigate={navigate} onAuthenticated={handleAuthenticated} />
    </Suspense>
  );

  if (requiresAuth && (!authReady || !user)) {
    return <PageLoader />;
  }

  return isPublic ? (
    pageContent
  ) : (
    <div className="flex h-screen min-h-[900px] flex-col overflow-hidden bg-bg">
      <Navbar active={page} onNavigate={navigate} user={user} onSignOut={handleSignOut} />
      <div className="flex min-h-0 flex-1">
        <Sidebar active={page} onNavigate={navigate} />
        <main className="min-w-0 flex-1 overflow-y-auto">{pageContent}</main>
      </div>
    </div>
  );
}
