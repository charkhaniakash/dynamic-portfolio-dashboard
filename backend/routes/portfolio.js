const express = require("express");
const router = express.Router();
const { getCMP } = require("../services/yahoo");
const { getStockData } = require("../services/google");
const stocks = require("../data/portfolio.json");

const totalInvestment = stocks.reduce((sum, s) => sum + s.purchasePrice * s.qty, 0);

// Firing all 29 at once gets the IP flagged by Yahoo. 2s between batches avoids that.
async function runInBatches(items, fn, batchSize = 5, delayMs = 2000) {
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

async function enrichStock(stock) {
  // getCMP tries Yahoo first, falls back to Google on 429
  // getStockData is always Google (P/E + EPS are only on Google Finance)
  const [cmp, { peRatio, latestEarnings }] = await Promise.all([
    getCMP(stock.yahooSymbol, stock.exchangeCode, stock.exchangeType),
    getStockData(stock.exchangeCode, stock.exchangeType).then((d) => ({
      peRatio: d.peRatio,
      latestEarnings: d.latestEarnings,
    })),
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

router.get("/", async (_req, res, next) => {
  try {
    const results = await runInBatches(stocks, enrichStock);

    const enriched = results.map((result, i) => {
      if (result.status === "fulfilled") return result.value;

      console.error(`[portfolio] ${stocks[i].name}:`, result.reason?.message);
      const investment = stocks[i].purchasePrice * stocks[i].qty;
      return {
        ...stocks[i],
        investment,
        cmp: null,
        presentValue: null,
        gainLoss: null,
        gainLossPercent: null,
        portfolioPercent: (investment / totalInvestment) * 100,
        peRatio: null,
        latestEarnings: null,
      };
    });

    res.json({
      stocks: enriched,
      totalInvestment,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
