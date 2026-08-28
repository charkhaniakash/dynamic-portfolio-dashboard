const cache = require("./cache");
const { getStockData } = require("./google");

// Uses Yahoo's v8 chart API (no auth needed).
// Falls back to Google Finance CMP when Yahoo rate-limits (429).
async function getCMP(yahooSymbol, exchangeCode, exchangeType) {
  if (!yahooSymbol) {
    const d = await getStockData(exchangeCode, exchangeType);
    return d.cmp;
  }

  const cacheKey = `yahoo:${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    if (res.status === 429) {
      console.warn(`[yahoo] ${yahooSymbol}: rate limited, using Google CMP`);
      const d = await getStockData(exchangeCode, exchangeType);
      return d.cmp;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const cmp = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    cache.set(cacheKey, cmp);
    return cmp;
  } catch (err) {
    console.error(`[yahoo] ${yahooSymbol}: ${err.message}`);
    const d = await getStockData(exchangeCode, exchangeType);
    return d.cmp;
  }
}

module.exports = { getCMP };
