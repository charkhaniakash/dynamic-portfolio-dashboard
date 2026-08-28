# Technical Write-up

Real issues I ran into while building this, and what I did about them.

---

## Yahoo Finance kept blocking requests

Started with `yahoo-finance2` since it's the most widely used library for this. Single symbol worked fine in testing. The moment I fired all 29 stocks at once, Yahoo started returning 429s for most of them.

The library internally uses Yahoo's v7 quote endpoint which needs a crumb + cookie handshake before every request. Hitting 29 of these simultaneously from one IP looks like abuse to their CDN regardless of whether the handshake succeeds.

Tried two things that didn't work:

First, batching with small delays — still got blocked because by that point the dev machine IP was already flagged from all the earlier test runs.

Second, scraping the Yahoo Finance HTML page directly — this hit a `Parse Error: Header overflow` because Yahoo's response headers are unusually large and Node's default HTTP parser has a size limit.

What actually worked was Yahoo's v8 chart API (`/v8/finance/chart/SYMBOL`). No crumb, no cookie, just a straight GET. Also switched from axios to Node's native `fetch` — axios and Yahoo apparently don't get along at the TLS fingerprinting level, while native fetch goes through cleanly.

Even with v8, rapid-fire concurrent requests from the same IP still trigger a temporary block. So the final setup is:

- Requests go out in batches of 5 with a 2 second gap between batches
- If Yahoo returns 429 for a stock, it falls back to scraping CMP from Google Finance instead
- A 15 second cache means the same IP doesn't hammer Yahoo on every frontend poll

Yahoo is still attempted first on every fresh request — Google is just the safety net.

---

## Yahoo symbol mapping was a mess

BSE numeric codes (like `532174` for ICICI Bank) mostly return 404 on Yahoo. Yahoo works with NSE tickers. Had to manually verify the correct Yahoo ticker for each of the 29 stocks.

Two specific cases worth noting:

**LTI Mindtree** — tried `LTIM.NS`, `LTIMINDTREE.NS`, `540005.BO`, a few others. All 404. The company merged from LTI and Mindtree fairly recently and Yahoo hasn't settled on a ticker. Google Finance handles it fine at `LTIM:NSE` so P/E and EPS work, but CMP shows `—` for this stock. Not going to fake a value.

**Bajaj Housing** — the BSE code `544252` doesn't resolve on Yahoo. The correct ticker is `BAJAJHFL.NS` which is the Bajaj Housing Finance entity. Easy to miss if you're just appending `.NS` to whatever code is in the sheet.

To avoid this being a runtime problem, each stock in `portfolio.json` has an explicit `yahooSymbol` field. Stocks with no working symbol have `yahooSymbol: null`.

---

## Google Finance scraping

No API exists. The quote page has what we need — P/E ratio and EPS — but the CSS class names are minified (`SwQK7` for the label, `dO6ijd` for the value). These are the kind of names that change when Google does a frontend deploy.

If the scraper suddenly returns null for everything, those class names are the first thing to check. The scraper is in one file (`services/google.js`) so it's a quick fix.

One thing that looked like a bug but wasn't — Savani Financials and a few other small-caps return null P/E and negative EPS. That's just the actual data, not a parsing issue.

---

## `Promise.allSettled` over `Promise.all`

With 29 external HTTP calls, at least one is going to fail at some point. `Promise.all` would cancel the whole batch and return nothing. `Promise.allSettled` lets all 29 run independently and gives back a result for each one, success or failure. Failed stocks get null for their live fields but still show up in the table with their static data intact.

---

## The cache

TTL is 15 seconds, same as the frontend poll interval. On the first request everything hits Yahoo and Google. After that, responses are served from an in-memory Map until the entries expire.

The limitation worth knowing: this cache lives in Node process memory. It resets on every server restart and if you ever run multiple backend instances they'll each have their own separate cache, which means more external requests than you'd expect. Redis is the straightforward fix for that scenario, but for a single instance it's not needed.

---

## Sector grouping on the frontend

The backend just returns a flat array of enriched stocks with a `sector` field on each. The frontend groups them.

Could have done this on the backend, but keeping the API response as a flat list means it stays simple for anything else that might consume it later. The grouping itself is just a Map traversal over 29 items — not worth making the backend do it.
