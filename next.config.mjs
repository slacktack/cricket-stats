/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
  devIndicators: false,
  images: {
    // Vercel's free optimizer quota ran out; flags load straight from Cricbuzz.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.cricbuzz.com",
      },
    ],
  },
};

export default nextConfig;
