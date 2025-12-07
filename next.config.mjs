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
  // Disable standalone output for local builds (Windows symlink issues)
  // Enable for Docker: output: 'standalone',
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize for production
  poweredByHeader: false,
}

export default nextConfig