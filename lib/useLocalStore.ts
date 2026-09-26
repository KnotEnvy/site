"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed value for per-visitor conveniences (reading-plan
 * ticks, private study notes). Never for anything that must persist reliably:
 * storage can be empty, blocked or throw (private windows, cleared data), so
 * every access is guarded and the UI must work without it.
 *
 * useSyncExternalStore keeps it SSR-safe - the server snapshot is always the
 * fallback - and it satisfies the React-Compiler rule against setState in
 * effects (handoff.json criticalLessons #8).
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the value simply won't persist.
  }
  emit();
}

export function useLocalStore(key: string, fallback = ""): [string, (v: string | null) => void] {
  // Stable per key, so React doesn't unsubscribe/resubscribe on every render.
  const subscribe = useCallback(
    (cb: () => void) => {
      listeners.add(cb);
      // Other tabs editing the same key.
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback
  );
  const set = useCallback((v: string | null) => write(key, v), [key]);
  return [value, set];
}
