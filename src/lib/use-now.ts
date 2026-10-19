"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared minute-resolution clock.
 *
 * Relative timestamps ("3m ago") need the current time, but calling
 * `Date.now()` during render is impure: the same props can produce different
 * output on every render. Subscribing to a ticking external store keeps the
 * value stable between renders and refreshes it on a schedule instead.
 *
 * The server snapshot is `0`; components that render relative times only do so
 * from client-fetched data, so this never reaches the hydration markup.
 */

const TICK_MS = 60_000;

let currentTime = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notify() {
  currentTime = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!timer) {
    currentTime = Date.now();
    timer = setInterval(notify, TICK_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  return currentTime;
}

function getServerSnapshot() {
  return 0;
}

/** Current epoch milliseconds, refreshed once a minute while mounted. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
