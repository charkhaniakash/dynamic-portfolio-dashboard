const cache = require("./cache");
const { getStockData } = require("./google");
const httpClient = require("./httpClient");

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
    const res = await httpClient.get(url);
    const data = res.data;
    const cmp = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    cache.set(cacheKey, cmp);
    return cmp;
  } catch (err) {
    if (err.response && err.response.status === 429) {
      console.warn(`[yahoo] ${yahooSymbol}: rate limited, using Google CMP`);
    } else {
      console.error(`[yahoo] ${yahooSymbol}: ${err.message}`);
    }
    const d = await getStockData(exchangeCode, exchangeType);
    return d.cmp;
  }
}

module.exports = { getCMP };
