import { PrismaClient } from "@prisma/client";

const DEFAULT_DATABASE_URL =
  "mysql://u633779242_novaAdmin:Bipul%4010%40hpanel@127.0.0.1:3306/u633779242_nova?connection_limit=10&pool_timeout=20";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

