import type { NextConfig } from "next";

// Config undangan (dan foto cover untuk gambar Open Graph) dibaca dari disk saat runtime;
// pastikan ikut ter-deploy ke fungsi serverless di Vercel.
const DATA = "./data/**/*.json";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/[slug]": [DATA],
    "/[slug]/admin": [DATA],
    "/[slug]/opengraph-image": [DATA, "./public/img/**/*"],
    "/api/rsvp": [DATA],
    "/api/wishes": [DATA],
    "/api/admin": [DATA],
    "/api/ics": [DATA],
  },
};

export default nextConfig;
