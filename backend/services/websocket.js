const { WebSocketServer } = require("ws");
const { getEnrichedPayload } = require("../routes/portfolio");

const PUSH_INTERVAL = 15000;

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  async function broadcast() {
    if (wss.clients.size === 0) return;
    try {
      const payload = await getEnrichedPayload();
      const message = JSON.stringify(payload);
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) client.send(message);
      });
    } catch (err) {
      console.error("[ws] broadcast failed:", err.message);
    }
  }

  wss.on("connection", async (ws) => {
    console.log("[ws] client connected, total:", wss.clients.size);

    getEnrichedPayload().then(payload => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    }).catch(err => {
      console.error("[ws] initial push failed:", err.message);
    });

    ws.on("close", () => {
      console.log("[ws] client disconnected, total:", wss.clients.size);
    });
  });

  setInterval(broadcast, PUSH_INTERVAL);
  console.log("[ws] WebSocket server ready");
}

module.exports = { initWebSocket };
