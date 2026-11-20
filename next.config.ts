import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is used during `next dev` only.
  // Production builds on Vercel use SWC/Webpack — these options are dev-only.
  experimental: {
    // Keep partial prefetching for the production router
    ppr: false,
  },
};

export default nextConfig;
