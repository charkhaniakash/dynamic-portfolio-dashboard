// Simple Map-based cache. Resets on restart — fine for a single instance.
// If this ever runs behind a load balancer, swap this out for Redis.

const store = new Map();
const TTL_MS = 15000;

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
