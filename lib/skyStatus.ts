"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the WebGL sky is actually running. CloudCanvas flips this to
 * "disabled" when it gives up after repeated context losses (or the error
 * boundary trips), so pages whose STORY depends on the canvas - The Ascent's
 * particle figure - can swap in a static illustration instead of leaving an
 * empty stage beside the text.
 */
export type SkyStatus = "ok" | "disabled";

let status: SkyStatus = "ok";
const listeners = new Set<() => void>();

export function setSkyStatus(next: SkyStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** "ok" on the server and until the canvas reports otherwise. */
export function useSkyStatus(): SkyStatus {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => "ok"
  );
}
