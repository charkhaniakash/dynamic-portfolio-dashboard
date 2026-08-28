// In-memory cache keyed by stock symbol.
// Lives in module scope so it persists across requests within the same process.
// Limitation: resets on server restart and is not shared across multiple instances —
// Redis would be the natural next step when scaling horizontally.

const store = new Map();

const TTL_MS = 15000; // matches the frontend poll interval

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function set(key, data) {
  store.set(key, { data, timestamp: Date.now() });
}

module.exports = { get, set };
