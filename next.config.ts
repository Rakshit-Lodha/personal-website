import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // The Roman v2 design is the homepage. beforeFiles, so it wins over app/page.tsx; the URL stays "/".
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/roman-v2" }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
