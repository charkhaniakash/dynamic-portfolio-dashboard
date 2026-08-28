const http = require("http");
const express = require("express");
const cors = require("cors");
const portfolioRouter = require("./routes/portfolio");
const { initWebSocket } = require("./services/websocket");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
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
});
