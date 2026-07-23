import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Energy Drink line hidden until market-ready. Temporary redirects (not
  // permanent) so /drinks* never surfaces unfinished product; remove to relaunch.
  async redirects() {
    return [
      { source: "/drinks", destination: "/", permanent: false },
      { source: "/drinks/:flavor", destination: "/", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      // Admin-uploaded product images live in Vercel Blob (public store).
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
