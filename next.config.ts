import type { NextConfig } from "next";

/**
 * CSP notes (security review, 10 Oct 2026):
 * script-src keeps 'unsafe-inline' after a full investigation — Next.js 16
 * App Router inlines the RSC flight payload (self.__next_f.push, ~10KB,
 * different every build) so hash-pinning can't cover it, experimental SRI
 * does not externalize it, and per-request nonces are broken in Next 16
 * (verified: nonce set on request headers + dynamic rendering, both
 * bundlers — Next never stamps it onto script tags). Acceptable here
 * because React escapes all rendered content and the app has no
 * dangerouslySetInnerHTML/innerHTML sink, no accounts, no uploads.
 * Do NOT remove the other directives; they are all enforced.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
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
