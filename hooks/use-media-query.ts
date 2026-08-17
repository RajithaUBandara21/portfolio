"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

// useSyncExternalStore is the correct primitive for subscribing to a browser API like
// matchMedia: it returns the SSR snapshot (`false`, since the server has no viewport) until
// hydration, then switches to the live client value — no manual "mounted" effect needed.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
