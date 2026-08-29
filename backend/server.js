const http = require("http");
const express = require("express");
const cors = require("cors");
const portfolioRouter = require("./routes/portfolio");
const { initWebSocket } = require("./services/websocket");

const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());
app.use("/api/portfolio", portfolioRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((err, _req, res, _next) => {
  console.error("[server]", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);

  portfolioRouter.warmCache().catch((err) => {
    console.error("[server] cache warmup failed:", err.message);
  });


  const SELF_URL = process.env.RENDER_EXTERNAL_URL;
  if (SELF_URL) {
    const PING_INTERVAL = 10 * 60 * 1000; // every 10 minutes
    setInterval(() => {
      const http = require("http");
      const https = require("https");
      const url = `${SELF_URL}/health`;
      const client = url.startsWith("https") ? https : http;
      client.get(url, (res) => {
        console.log(`[server] self-ping ${url} → ${res.statusCode}`);
      }).on("error", (err) => {
        console.warn(`[server] self-ping failed: ${err.message}`);
      });
    }, PING_INTERVAL);
    console.log(`[server] keep-alive ping enabled → ${SELF_URL}/health every 10m`);
  }
});
