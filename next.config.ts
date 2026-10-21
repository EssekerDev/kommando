import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ]
  },
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: { position: "top-right" },
  turbopack: {
    rules: {
      ["*.css"]: {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
