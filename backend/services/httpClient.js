const axios = require("axios");
const { SCRAPER_API_URL } = require("../config/urls");

function resolveUrl(url) {
  if (process.env.SCRAPER_API_KEY) return SCRAPER_API_URL(url);
  return url;
}

const httpClient = {
  async get(url, config = {}) {
    return axios.get(resolveUrl(url), {
      ...config,
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        ...config.headers,
      },
    });
  },
};

module.exports = httpClient;
