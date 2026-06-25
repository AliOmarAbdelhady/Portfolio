"use client";

import { useCallback, useSyncExternalStore } from "react";

function readMatches(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

/**
 * Subscribe to a media query, SSR-safe and without setState-in-effect.
 * Uses useSyncExternalStore so there are no cascading renders on mount.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => readMatches(query),
    () => false,
  );
}

/** Convenience: true on coarse-pointer / small screens (disable heavy FX). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

/** True when the device has a fine pointer (mouse/trackpad). */
export function useIsFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
