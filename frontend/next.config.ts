import type { NextConfig } from "next";

// baked in at build time; docker-compose passes http://backend:8000
const api = process.env.BACKEND_URL || "http://localhost:8055";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      { source: "/docs", destination: `${api}/docs` },
      { source: "/openapi.json", destination: `${api}/openapi.json` },
    ];
  },
};

export default nextConfig;
