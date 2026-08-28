export interface Stock {
  name: string;
  purchasePrice: number;
  qty: number;
  exchangeCode: string;
  exchangeType: "NSE" | "BSE";
  sector: string;
  // NSE ticker verified against Yahoo's v8 API. BSE numeric codes mostly 404 on Yahoo.
  // null for stocks where Yahoo has no working symbol (e.g. recently merged entities).
  yahooSymbol: string | null;
}

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

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
}

export interface PortfolioResponse {
  stocks: EnrichedStock[];
  totalInvestment: number;
  fetchedAt: string;
}
