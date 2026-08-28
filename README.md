# Portfolio Dashboard

A live stock portfolio tracker that pulls real-time prices from Yahoo Finance and P/E + earnings data from Google Finance. The dashboard updates every 15 seconds and groups holdings by sector.

## Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | Next.js 16, React 19, Tailwind 4  |
| State    | Zustand                           |
| Table    | TanStack React Table v8           |
| Backend  | Node.js, Express 4                |
| Scraping | axios + cheerio                   |
| Monorepo | pnpm workspaces                   |

## Project Structure

```
dynamic-portfolio-dashboard/
├── frontend/          # Next.js app
│   ├── app/           # Pages and layout
│   ├── components/    # Table, SectorGroup, GainLossCell, etc.
│   ├── store/         # Zustand store + sector selector
│   ├── lib/           # fmt helpers, gainLoss color util
│   └── types/         # Shared TypeScript interfaces
│
└── backend/           # Express API
    ├── routes/        # GET /api/portfolio
    ├── services/
    │   ├── yahoo.js   # CMP via Yahoo Finance v8 chart API
    │   ├── google.js  # P/E + EPS via Google Finance scraper
    │   ├── cache.js   # In-memory TTL cache
    │   └── httpClient.js
    └── data/
        └── portfolio.json   # Seed data (29 stocks)
```

## Running Locally

**Prerequisites:** Node.js 18+, pnpm

```bash
# Install all dependencies
pnpm install

# Terminal 1 — backend (http://localhost:4000)
pnpm dev:backend

# Terminal 2 — frontend (http://localhost:3000)
pnpm dev:frontend
```

## Environment Variables

Create `frontend/.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

The backend has no required env vars for local development. For production, set `PORT` if you want a port other than 4000.

## How It Works

1. The frontend polls `GET /api/portfolio` every 15 seconds
2. The backend reads `portfolio.json` (static seed: name, purchase price, qty, sector)
3. For each stock, it concurrently fetches CMP from Yahoo and P/E + EPS from Google
4. Derived fields (investment, present value, gain/loss, portfolio %) are computed server-side
5. Results are cached for 15 seconds — matching the poll interval — to avoid hammering external sources on rapid requests
6. The frontend groups stocks by sector using a Zustand selector and renders summary rows per sector

## Adding or Updating Stocks

Edit `backend/data/portfolio.json`. Each entry needs:

```json
{
  "name": "Stock Name",
  "purchasePrice": 1000,
  "qty": 50,
  "exchangeCode": "SYMBOL",
  "exchangeType": "NSE",
  "sector": "Technology",
  "yahooSymbol": "SYMBOL.NS"
}
```

`exchangeCode` is the Google Finance identifier. `yahooSymbol` is the Yahoo ticker — use the NSE ticker with `.NS` suffix; BSE numeric codes don't resolve reliably on Yahoo. Set `yahooSymbol` to `null` if Yahoo has no working symbol for a stock.
