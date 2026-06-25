"use client";

/**
 * Read a CSS custom property from :root and keep it in sync when the theme
 * (next-themes toggles `.dark` on <html>) changes. Returns a THREE-compatible
 * hex string. SSR-safe: returns the fallback until measured on the client.
 *
 * Used by the WebGL layer so the road/particle colours match the active theme
 * without importing Tailwind tokens into the shader layer.
 */
import { useEffect, useState } from "react";
import * as THREE from "three";

export function useThemeColor(
  token: string,
  fallback: string,
): THREE.Color {
  const [color, setColor] = useState<THREE.Color>(
    () => new THREE.Color(fallback),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    const read = () => {
      const raw = getComputedStyle(root)
        .getPropertyValue(token)
        .trim();
      try {
        setColor(new THREE.Color(raw || fallback));
      } catch {
        /* keep previous value if the token is malformed */
      }
    };

    read();

    // next-themes flips the `.dark` class on <html>. Watch that + any attr
    // mutation so a theme toggle recolours the scene immediately.
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [token, fallback]);

  return color;
}
