import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  postcssOptions: {
    config: './postcss.config.mjs',
  },
};

export default nextConfig;
