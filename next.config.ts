import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enables src/instrumentation.ts — auto-runs DB init on server boot
  instrumentationHook: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
