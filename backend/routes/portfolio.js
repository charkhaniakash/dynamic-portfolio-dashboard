const express = require("express");
const router = express.Router();
const { getCMP } = require("../services/yahoo");
const { getStockData } = require("../services/google");
const stocks = require("../data/portfolio.json");

const totalInvestment = stocks.reduce((sum, s) => sum + s.purchasePrice * s.qty, 0);


function buildFallbackStock(stock) {
  const investment = stock.purchasePrice * stock.qty;
  return {
    ...stock,
    investment,
    cmp: null,
    presentValue: null,
    gainLoss: null,
    gainLossPercent: null,
    portfolioPercent: (investment / totalInvestment) * 100,
    peRatio: null,
    latestEarnings: null,
  };
}

function buildFallbackPayload() {
  return {
    stocks: stocks.map(buildFallbackStock),
    totalInvestment,
    fetchedAt: new Date().toISOString(),
  };
}

async function enrichStock(stock) {
  const [cmp, { peRatio, latestEarnings }] = await Promise.all([
    getCMP(stock.yahooSymbol, stock.exchangeCode, stock.exchangeType),
    getStockData(stock.exchangeCode, stock.exchangeType),
  ]);

  const investment = stock.purchasePrice * stock.qty;
  const presentValue = cmp != null ? cmp * stock.qty : null;
  const gainLoss = presentValue != null ? presentValue - investment : null;
  const gainLossPercent = gainLoss != null ? (gainLoss / investment) * 100 : null;
  const portfolioPercent = (investment / totalInvestment) * 100;

  return {
    ...stock,
    investment,
    cmp,
    presentValue,
    gainLoss,
    gainLossPercent,
    portfolioPercent,
    peRatio,
    latestEarnings,
  };
}


let activeEnrichment = null;


async function runInBatches(items, fn, batchSize = 3, delayMs = 300) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

function getOrStartEnrichment() {
  if (activeEnrichment) return activeEnrichment;

  activeEnrichment = runInBatches(stocks, enrichStock)
    .then((results) =>
      results.map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        console.error(`[portfolio] ${stocks[i].name}: ${r.reason?.message}`);
        return buildFallbackStock(stocks[i]);
      })
    )
    .finally(() => {
      activeEnrichment = null;
    });

  return activeEnrichment;
}


async function warmCache() {
  console.log("[portfolio] warming cache in background...");
  getOrStartEnrichment()
    .then(() => console.log("[portfolio] cache warm"))
    .catch((err) => console.error("[portfolio] warmup error:", err.message));
}


async function getEnrichedPayload() {
  const enriched = await getOrStartEnrichment();
  return { stocks: enriched, totalInvestment, fetchedAt: new Date().toISOString() };
}


router.get("/", (_req, res) => {
  getOrStartEnrichment().catch(() => { });

  res.json(buildFallbackPayload());
});

module.exports = router;
module.exports.warmCache = warmCache;
module.exports.getEnrichedPayload = getEnrichedPayload;
