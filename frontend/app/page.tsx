"use client";

import { useEffect } from "react";
import PortfolioTable from "@/components/PortfolioTable";
import MobileStockCard from "@/components/MobileStockCard";
import ErrorBanner from "@/components/ErrorBanner";
import TableSkeleton from "@/components/TableSkeleton";
import { usePortfolioStore, selectGroupedBySector } from "@/store/portfolioStore";
import { useMemo } from "react";

const POLL_INTERVAL = 15000;

export default function Home() {
  const { stocks, lastUpdated, loading, error, fetch } = usePortfolioStore();
  const groups = useMemo(() => selectGroupedBySector(stocks), [stocks]);

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
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <PortfolioTable stocks={stocks} />
          </div>

          {/* Mobile — card view per sector */}
          <div className="md:hidden space-y-6">
            {groups.map((group) => (
              <div key={group.sector}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {group.sector}
                </h2>
                <div className="space-y-3">
                  {group.stocks.map((stock) => (
                    <MobileStockCard key={stock.name} stock={stock} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
