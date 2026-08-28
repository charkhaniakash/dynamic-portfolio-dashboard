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

// SwQK7 is the label class, dO6ijd is the value next to it.
// These are obfuscated class names — worth checking if scraping breaks after a Google deploy.
async function getPEAndEarnings(exchangeCode, exchangeType) {
  const symbol = toGoogleSymbol(exchangeCode, exchangeType);
  const cacheKey = `google:${symbol}`;

  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  const url = `https://www.google.com/finance/quote/${symbol}`;

  try {
    const { data } = await httpClient.get(url);
    const $ = cheerio.load(data);

    let peRatio = null;
    let latestEarnings = null;

    $(".SwQK7").each((_i, el) => {
      const label = $(el).text().trim();
      const value = $(el).siblings(".dO6ijd").text().trim();
      if (label === "P/E ratio") peRatio = parseValue(value);
      if (label === "EPS") latestEarnings = parseValue(value);
    });

    const result = { peRatio, latestEarnings };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[google] ${symbol}: ${err.message}`);
    return { peRatio: null, latestEarnings: null };
  }
}

module.exports = { getPEAndEarnings };
