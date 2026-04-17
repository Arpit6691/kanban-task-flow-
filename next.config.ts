import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fix Vercel lockfile detection warning
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
