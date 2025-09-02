import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/functions/v1/scan-receipt', // The incoming request path
        destination: 'https://weuzthzoabbtzxkwctan.supabase.co/functions/v1/scan-receipt', // The path to which it's redirected
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }, {protocol: "https", hostname: "pngimg.com"}],
  },
};

export default nextConfig;