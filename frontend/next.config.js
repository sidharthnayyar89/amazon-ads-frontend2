/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://amazons-ads-backend.onrender.com/api/:path*" },
      { source: "/health", destination: "https://amazons-ads-backend.onrender.com/health" },
    ];
  },
};
module.exports = nextConfig;
