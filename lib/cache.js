const store = new Map();

export function getCache(key, ttlMs) {
  try {
    const value = store.get(key);
    if (!value) return null;
    if (Date.now() - value.ts > ttlMs) return null;
    return value.data;
  } catch {
    return null;
  }
}

export function setCache(key, data) {
  try {
    store.set(key, { data, ts: Date.now() });
  } catch {}
}

export function getStoreSize() {
  return store.size;
}





