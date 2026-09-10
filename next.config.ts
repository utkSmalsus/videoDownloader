import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up to an unrelated lockfile
  // higher in the directory tree (this project intentionally has no parent workspace).
  turbopack: { root: __dirname },
};

export default nextConfig;
