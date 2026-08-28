import { create } from "zustand";
import { EnrichedStock, SectorSummary } from "@/types/portfolio";

export interface SectorGroup {
  sector: string;
  stocks: EnrichedStock[];
  summary: SectorSummary;
}

interface PortfolioState {
  stocks: EnrichedStock[];
  totalInvestment: number;
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const usePortfolioStore = create<PortfolioState>((set) => ({
  stocks: [],
  totalInvestment: 0,
  lastUpdated: null,
  loading: true,
  error: null,

  fetch: async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolio`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      set({
        stocks: data.stocks,
        totalInvestment: data.totalInvestment,
        lastUpdated: data.fetchedAt,
        error: null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch portfolio",
        loading: false,
      });
    }
  },
}));

// Derived selector — groups stocks by sector and computes per-sector totals.
// Kept outside the store state because it's pure derived data, not stored state.
export function selectGroupedBySector(stocks: EnrichedStock[]): SectorGroup[] {
  const map = new Map<string, EnrichedStock[]>();

  for (const stock of stocks) {
    const group = map.get(stock.sector) ?? [];
    group.push(stock);
    map.set(stock.sector, group);
  }

  return Array.from(map.entries()).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce((s, st) => s + st.investment, 0);

    // If any stock in the sector is missing a present value, the sector total is null —
    // showing a partial sum would be misleading.
    const allHavePV = sectorStocks.every((st) => st.presentValue != null);
    const totalPresentValue = allHavePV
      ? sectorStocks.reduce((s, st) => s + st.presentValue!, 0)
      : null;

    const totalGainLoss =
      totalPresentValue != null ? totalPresentValue - totalInvestment : null;

    return {
      sector,
      stocks: sectorStocks,
      summary: { sector, totalInvestment, totalPresentValue, totalGainLoss },
    };
  });
}
