import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // There are other lockfiles up-tree; pin the root to this project.
    root: __dirname,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
