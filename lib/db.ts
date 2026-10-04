import "server-only";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";

import { sanitizeLibsqlUrl } from "@/lib/db-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const { url, authToken } = sanitizeLibsqlUrl(process.env.DATABASE_URL);
  const token = process.env.DATABASE_AUTH_TOKEN || authToken;

  // Local: file:./prisma/dev.db. Deployed: a Turso libsql:// URL plus its auth token.
  const adapter = new PrismaLibSql({
    url,
    authToken: token || undefined,
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
