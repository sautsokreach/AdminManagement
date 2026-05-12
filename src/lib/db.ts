import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 types datasourceUrl as `never` when url is omitted from schema.prisma.
// Cast to any so TypeScript accepts it; the value is passed correctly at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaOptions: any = {
  datasourceUrl: process.env.DATABASE_URL,
  log: ["error"],
};

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
