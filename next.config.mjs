/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization for production
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize for production
  poweredByHeader: false,
}

export default nextConfig