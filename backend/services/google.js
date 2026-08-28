const cheerio = require("cheerio");
const httpClient = require("./httpClient");
const cache = require("./cache");

// Google uses "NSE" and "BOM" as exchange identifiers in their URLs
function toGoogleSymbol(exchangeCode, exchangeType) {
  return `${exchangeCode}:${exchangeType === "NSE" ? "NSE" : "BOM"}`;
}

function parseValue(str) {
  const n = parseFloat(str.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

// Scrapes CMP, P/E and EPS in one page hit.
// CMP is used as fallback when Yahoo rate-limits; P/E + EPS are always from here.
// SwQK7/dO6ijd are obfuscated class names — check these first if scraping breaks.
async function getStockData(exchangeCode, exchangeType) {
  const symbol = toGoogleSymbol(exchangeCode, exchangeType);
  const cacheKey = `google:${symbol}`;

  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  const url = `https://www.google.com/finance/quote/${symbol}`;

  try {
    const { data } = await httpClient.get(url);
    const $ = cheerio.load(data);

    const rawPrice = $(".N6SYTe span span").first().text().trim();
    const cmp = parseValue(rawPrice.replace(/[₹,\s]/g, ""));

    let peRatio = null;
    let latestEarnings = null;

    $(".SwQK7").each((_i, el) => {
      const label = $(el).text().trim();
      const value = $(el).siblings(".dO6ijd").text().trim();
      if (label === "P/E ratio") peRatio = parseValue(value);
      if (label === "EPS") latestEarnings = parseValue(value);
    });

    const result = { cmp, peRatio, latestEarnings };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[google] ${symbol}: ${err.message}`);
    return { cmp: null, peRatio: null, latestEarnings: null };
  }
}

module.exports = { getStockData };
