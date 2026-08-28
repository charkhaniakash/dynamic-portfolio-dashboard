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
  setData: (payload: { stocks: EnrichedStock[]; totalInvestment: number; fetchedAt: string }) => void;
  setError: (message: string) => void;
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

  setData: (payload) => {
    set({
      stocks: payload.stocks,
      totalInvestment: payload.totalInvestment,
      lastUpdated: payload.fetchedAt,
      error: null,
      loading: false,
    });
  },

  setError: (message) => {
    set({ error: message });
  },
}));

// Sector totals are derived, not stored — no point keeping them in Zustand state
export function selectGroupedBySector(stocks: EnrichedStock[]): SectorGroup[] {
  const map = new Map<string, EnrichedStock[]>();

  for (const stock of stocks) {
    const group = map.get(stock.sector) ?? [];
    group.push(stock);
    map.set(stock.sector, group);
  }

  return Array.from(map.entries()).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce((s, st) => s + st.investment, 0);

    // Don't sum present value if any stock in the sector is missing CMP —
    // a partial total is worse than showing nothing
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
