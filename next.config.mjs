/** @type {import('next').NextConfig} */
const nextConfig = {
  // pnpm virtual-store paths aren't always auto-traced into standalone output;
  // explicitly include @swc/helpers so the runner stage can resolve it.
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./node_modules/**/@swc/helpers/**'],
    },
  },
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
