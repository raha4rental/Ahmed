import type { NextConfig } from "next";

const native = process.env.NATIVE === "1";

const nextConfig: NextConfig = {
  ...(native
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    unoptimized: native,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
