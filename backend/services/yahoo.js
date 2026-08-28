const yahooFinance = require("yahoo-finance2").default;

// Yahoo uses .NS for NSE and .BO for BSE — numeric codes in the sheet are BSE.
function toYahooSymbol(exchangeCode, exchangeType) {
  return `${exchangeCode}${exchangeType === "NSE" ? ".NS" : ".BO"}`;
}

async function getCMP(exchangeCode, exchangeType) {
  const symbol = toYahooSymbol(exchangeCode, exchangeType);
  try {
    const result = await yahooFinance.quote(symbol, {
      fields: ["regularMarketPrice"],
    });
    return result?.regularMarketPrice ?? null;
  } catch (err) {
    console.error(`[yahoo] ${symbol}: ${err.message}`);
    return null;
  }
}

module.exports = { getCMP };
