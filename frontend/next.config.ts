import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://backend-4n2msx870-pwas-projects-71c7ebac.vercel.app/api/:path*'
          : 'http://localhost:5000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
