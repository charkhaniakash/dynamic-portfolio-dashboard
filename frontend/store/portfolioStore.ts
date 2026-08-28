import { create } from "zustand";
import { EnrichedStock } from "@/types/portfolio";

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
