import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  // Increase body size limits for file uploads
  experimental: {
    // Enable body size configuration for App Router
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Configure external packages
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
