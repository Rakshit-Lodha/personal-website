import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  async redirects() {
    return [
      {
        source: "/roman-v2/reading",
        destination: "/reading",
        permanent: true,
      },
      {
        source: "/roman-v2/reading/:date",
        destination: "/reading/:date",
        permanent: true,
      },
    ];
  },
  // The Roman v2 design is the homepage. beforeFiles, so it wins over app/page.tsx; the URL stays "/".
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/roman-v2" },
        { source: "/reading", destination: "/roman-v2/reading" },
        { source: "/reading/:date", destination: "/roman-v2/reading/:date" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
