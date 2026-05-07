import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

function createDb() {
  const isProd = process.env.NODE_ENV === "production" || process.env.TURSO_DATABASE_URL;

  const adapter = isProd
    ? new PrismaLibSql({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      })
    : new PrismaLibSql({
        url: `file:${path.resolve(process.cwd(), "prisma", "dev.db")}`,
      });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || createDb();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
