const express = require("express");
const router = express.Router();
const { getCMP } = require("../services/yahoo");
const { getPEAndEarnings } = require("../services/google");
const stocks = require("../data/portfolio.json");

const totalInvestment = stocks.reduce((sum, s) => sum + s.purchasePrice * s.qty, 0);

async function enrichStock(stock) {
  const [cmp, { peRatio, latestEarnings }] = await Promise.all([
    getCMP(stock.yahooSymbol),
    getPEAndEarnings(stock.exchangeCode, stock.exchangeType),
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
    const results = await Promise.allSettled(stocks.map(enrichStock));

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
