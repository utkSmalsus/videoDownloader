/**
 * Tiny external store over one localStorage key, built for React's useSyncExternalStore —
 * avoids the "setState in an effect just to read a browser API" pattern entirely, so no
 * hydration-mismatch flash and no extra render caused by an effect.
 */
export function createLocalStore<T>(key: string, defaultValue: T) {
  let cache = defaultValue;
  let initialized = false;
  const listeners = new Set<() => void>();

  function read(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function getSnapshot(): T {
    if (!initialized) {
      cache = read();
      initialized = true;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function set(value: T): void {
    cache = value;
    initialized = true;
    localStorage.setItem(key, JSON.stringify(value));
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getSnapshot, getServerSnapshot, set, subscribe };
}
