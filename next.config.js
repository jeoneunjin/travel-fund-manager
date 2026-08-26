/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로젝트는 lib/CLAUDE.md로 관리 중 — 루트에 AGENTS.md/CLAUDE.md 자동 생성 방지
  agentRules: false,
  // Prisma v7 uses import.meta.url, node: built-ins, and CJS/ESM hybrid
  // that webpack cannot bundle correctly in RSC context.
  // Treat them as external so Next.js requires them at runtime instead.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  images: { unoptimized: true },
};

module.exports = nextConfig;
