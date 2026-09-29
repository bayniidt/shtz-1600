import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/shtz-1600" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
