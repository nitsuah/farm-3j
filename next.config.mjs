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
  // Keep local Windows builds stable while enabling Docker standalone output.
  output: process.env.DOCKER === '1' ? 'standalone' : undefined,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize for production
  poweredByHeader: false,
};

export default nextConfig;
