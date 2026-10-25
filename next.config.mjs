/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.cricbuzz.com",
      },
    ],
  },
};

export default nextConfig;
