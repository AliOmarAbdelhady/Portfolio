import type { NextConfig } from "next";

/**
 * Strict CSP without 'unsafe-inline' for scripts. The single inline script
 * Next emits (next-themes' deterministic theme-init snippet) is pinned by
 * its SHA-256 — verified stable across builds. If next-themes or the
 * ThemeProvider config ever changes, recompute: serve the page, extract the
 * <script>…</script> body, base64(sha256(...)), update THEME_SCRIPT_HASH.
 * (A per-request nonce was not usable: Next 16 does not stamp nonces onto
 * its script tags, and strict-dynamic would then block everything.)
 * Dev keeps unsafe-inline/eval: React dev overlays and HMR require them.
 */
const THEME_SCRIPT_HASH = "sha256-osMMQj3FsFuFoINhDY6u/ERO7gP52tI8DTruJmDXHD8=";
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' '${THEME_SCRIPT_HASH}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  turbopack: {
    // There are other lockfiles up-tree; pin the root to this project.
    root: __dirname,
  },
  reactStrictMode: true,
  // Baseline hardening: no framing (clickjacking), no MIME sniffing, no
  // geolocation/camera/mic, COOP isolates the window opener, CSP pins every
  // resource class the site actually uses.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
