import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config undangan dibaca dari disk saat runtime; pastikan ikut ter-deploy di Vercel.
  outputFileTracingIncludes: {
    "/[slug]": ["./data/**/*.json"],
  },
};

export default nextConfig;
