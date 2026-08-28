const httpClient = require("./httpClient");
const cache = require("./cache");

// v7 quote API needs a crumb + cookie handshake and throttles hard when you
// hit 29 symbols at once. v8 chart endpoint doesn't need any of that.
async function getCMP(yahooSymbol) {
  if (!yahooSymbol) return null;

  const cacheKey = `yahoo:${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const { data } = await httpClient.get(url);
    const cmp = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    cache.set(cacheKey, cmp);
    return cmp;
  } catch (err) {
    console.error(`[yahoo] ${yahooSymbol}: ${err.message}`);
    return null;
  }
}

module.exports = { getCMP };
