import { useEffect, useRef } from "react";
import { usePortfolioStore } from "@/store/portfolioStore";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";
const POLL_INTERVAL = 15000;
const RECONNECT_DELAY = 3000;

export function usePortfolioSocket() {
  const { fetch, setData, setError } = usePortfolioStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track whether we've ever received data — we only show "connection lost"
  // if the socket was working before and then dropped, not on the initial connect attempt
  const hasReceivedData = useRef(false);

  function clearTimers() {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (pollTimer.current) clearInterval(pollTimer.current);
  }

  function startPollingFallback() {
    console.warn("[socket] WebSocket unavailable, falling back to polling");
    fetch();
    pollTimer.current = setInterval(fetch, POLL_INTERVAL);
  }

  function connect() {
    if (typeof WebSocket === "undefined") {
      startPollingFallback();
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[socket] connected");
      clearTimers();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        hasReceivedData.current = true;
        setData(data);
      } catch {
        console.error("[socket] failed to parse message");
      }
    };

    // onerror always fires before onclose — let onclose handle reconnection.
    // Showing an error here causes a flash on every page load.
    ws.onerror = () => {
      console.warn("[socket] connection error");
    };

    ws.onclose = () => {
      // Only surface the error banner if we had a working connection before.
      // On first load, the socket might briefly fail while the backend warms up.
      if (hasReceivedData.current) {
        setError("Connection dropped — reconnecting...");
      }
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };
  }

  useEffect(() => {
    connect();
    return () => {
      clearTimers();
      wsRef.current?.close();
    };
  }, []);
}
