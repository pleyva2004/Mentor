/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ui', 'shared-types', 'utils'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
};

module.exports = nextConfig;
