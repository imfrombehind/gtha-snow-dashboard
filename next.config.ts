import type { NextConfig } from "next";

// Static export: `next build` writes a fully static site to /out for Vercel.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
