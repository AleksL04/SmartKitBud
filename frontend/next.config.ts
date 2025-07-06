import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }, {protocol: "https", hostname: "pngimg.com"}],
  },
};

export default nextConfig;