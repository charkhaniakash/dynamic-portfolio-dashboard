const YAHOO_CHART_URL = (symbol) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

const GOOGLE_FINANCE_URL = (symbol) =>
  `https://www.google.com/finance/quote/${symbol}`;

const SCRAPER_API_URL = (targetUrl) =>
  `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;

module.exports = { YAHOO_CHART_URL, GOOGLE_FINANCE_URL, SCRAPER_API_URL };
