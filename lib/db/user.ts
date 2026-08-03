// lib/db/user.ts
import { prisma } from "@/lib/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createUser(data: { email: string; name: string; passwordHash: string }) {
  return prisma.user.create({ data });
}
