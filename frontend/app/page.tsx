"use client";

import { useEffect } from "react";
import PortfolioTable from "@/components/PortfolioTable";
import ErrorBanner from "@/components/ErrorBanner";
import TableSkeleton from "@/components/TableSkeleton";
import { usePortfolioStore } from "@/store/portfolioStore";

const POLL_INTERVAL = 15000;

export default function Home() {
  const { stocks, lastUpdated, loading, error, fetch } = usePortfolioStore();

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const hasData = stocks.length > 0;

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
        {loading && hasData && (
          <span className="text-xs text-gray-500 animate-pulse">Refreshing…</span>
        )}
      </div>

      {error && <ErrorBanner message={error} stale={hasData} />}

      {loading && !hasData ? (
        <TableSkeleton />
      ) : (
        <PortfolioTable stocks={stocks} />
      )}
    </main>
  );
}
