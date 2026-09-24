import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The headline font is read from disk at runtime by lib/agent/headline.ts,
  // which any route that generates an image can reach.
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/*.ttf"],
  },
};

export default nextConfig;
