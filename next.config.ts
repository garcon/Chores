import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js the actual project root to avoid multi-lockfile warning
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
