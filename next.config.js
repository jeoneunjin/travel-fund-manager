/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prisma v7 uses import.meta.url, node: built-ins, and CJS/ESM hybrid
    // that webpack cannot bundle correctly in RSC context.
    // Treat them as external so Next.js requires them at runtime instead.
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@prisma/adapter-pg",
      "pg",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  swcMinify: false,
};

module.exports = nextConfig;
