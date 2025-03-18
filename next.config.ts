import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  // Completely disable development indicators
  devIndicators: false,
};

export default nextConfig;
