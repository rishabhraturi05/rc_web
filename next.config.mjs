import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/adsecs/:path*',
        destination: '/addsecs/:path*',
      },
      {
        source: '/adsecs',
        destination: '/addsecs',
      },
      {
        source: '/api/adsecs/:path*',
        destination: '/api/addsecs/:path*',
      },
    ];
  },
};

export default nextConfig;
