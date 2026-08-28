const cache = require("./cache");
const { getStockData } = require("./google");
const httpClient = require("./httpClient");
const { YAHOO_CHART_URL } = require("../config/urls");

async function getCMP(yahooSymbol, exchangeCode, exchangeType) {
  if (!yahooSymbol) {
    const d = await getStockData(exchangeCode, exchangeType);
    return d.cmp;
  }

  const cacheKey = `yahoo:${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const { data } = await httpClient.get(YAHOO_CHART_URL(yahooSymbol), {
      headers: { "Accept": "application/json" },
    });
    const cmp = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    cache.set(cacheKey, cmp);
    return cmp;
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn(`[yahoo] ${yahooSymbol}: rate limited, using Google CMP`);
    } else {
      console.error(`[yahoo] ${yahooSymbol}: ${err.message}`);
    }
    const d = await getStockData(exchangeCode, exchangeType);
    return d.cmp;
  }
}

module.exports = { getCMP };
