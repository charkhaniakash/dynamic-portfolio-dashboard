
const store = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

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
