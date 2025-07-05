import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "upload.wikimedia.org" }, { hostname: "pngimg.com" }],
  },
};

export default nextConfig;