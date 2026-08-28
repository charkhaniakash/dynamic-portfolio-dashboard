const cheerio = require("cheerio");
const httpClient = require("./httpClient");

// Google Finance uses "NSE" for NSE stocks and "BOM" for BSE stocks.
function toGoogleSymbol(exchangeCode, exchangeType) {
  return `${exchangeCode}:${exchangeType === "NSE" ? "NSE" : "BOM"}`;
}

// Strip currency symbols and parse — Google shows values like "₹51.21"
function parseFinanceValue(str) {
  const n = parseFloat(str.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

// Scraping approach is unavoidable — Google Finance has no public API.
// The CSS classes (SwQK7, dO6ijd) could change if Google redesigns the page.
async function getPEAndEarnings(exchangeCode, exchangeType) {
  const symbol = toGoogleSymbol(exchangeCode, exchangeType);
  const url = `https://www.google.com/finance/quote/${symbol}`;

  try {
    const { data } = await httpClient.get(url);

    const $ = cheerio.load(data);
    let peRatio = null;
    let latestEarnings = null;

    $(".SwQK7").each((_i, el) => {
      const label = $(el).text().trim();
      const value = $(el).siblings(".dO6ijd").text().trim();

      if (label === "P/E ratio") peRatio = parseFinanceValue(value);
      if (label === "EPS") latestEarnings = parseFinanceValue(value);
    });

    return { peRatio, latestEarnings };
  } catch (err) {
    console.error(`[google] ${symbol}: ${err.message}`);
    return { peRatio: null, latestEarnings: null };
  }
}

module.exports = { getPEAndEarnings };
