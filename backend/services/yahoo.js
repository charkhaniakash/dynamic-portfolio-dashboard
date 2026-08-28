const yahooFinance = require("yahoo-finance2").default;
const cache = require("./cache");

// Yahoo uses .NS for NSE and .BO for BSE — numeric codes in the sheet are BSE.
function toYahooSymbol(exchangeCode, exchangeType) {
  return `${exchangeCode}${exchangeType === "NSE" ? ".NS" : ".BO"}`;
}

async function getCMP(exchangeCode, exchangeType) {
  const symbol = toYahooSymbol(exchangeCode, exchangeType);
  const cacheKey = `yahoo:${symbol}`;

  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const result = await yahooFinance.quote(symbol, {
      fields: ["regularMarketPrice"],
    });
    const cmp = result?.regularMarketPrice ?? null;
    cache.set(cacheKey, cmp);
    return cmp;
  } catch (err) {
    console.error(`[yahoo] ${symbol}: ${err.message}`);
    return null;
  }
}

module.exports = { getCMP };
