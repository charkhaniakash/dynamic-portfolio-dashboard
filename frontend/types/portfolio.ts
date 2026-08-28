// Raw shape stored in portfolio.json — only fields that never change
export interface Stock {
  name: string;
  purchasePrice: number;
  qty: number;
  // The ticker symbol or BSE code used to look up live data.
  // NSE tickers are strings like "HDFCBANK"; BSE codes are 6-digit numbers stored as strings.
  exchangeCode: string;
  exchangeType: "NSE" | "BSE";
  sector: string;
}

// What the backend returns after enriching each stock with live data.
// Fields that couldn't be fetched are null — the UI handles the null display.
export interface EnrichedStock extends Stock {
  cmp: number | null;
  investment: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  portfolioPercent: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
}

// Sector-level aggregates computed from the enriched stocks in that group
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
}

// The full API response shape
export interface PortfolioResponse {
  stocks: EnrichedStock[];
  totalInvestment: number;
  fetchedAt: string;
}
