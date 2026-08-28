"use client";

import { useEffect } from "react";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioStore } from "@/store/portfolioStore";

const POLL_INTERVAL = 15000;

export default function Home() {
  const { stocks, lastUpdated, loading, error, fetch } = usePortfolioStore();

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Portfolio Dashboard</h1>
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()} · refreshes every 15s
            </p>
          )}
        </div>
        {loading && (
          <span className="text-xs text-gray-500 animate-pulse">Fetching live data…</span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <PortfolioTable stocks={stocks} />
    </main>
  );
}
