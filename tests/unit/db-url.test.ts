import { describe, expect, it } from "vitest";
import { sanitizeLibsqlUrl } from "@/lib/db-url";

describe("sanitizeLibsqlUrl", () => {
  it("defaults to local SQLite file when url is empty or undefined", () => {
    expect(sanitizeLibsqlUrl()).toEqual({ url: "file:./prisma/dev.db" });
    expect(sanitizeLibsqlUrl("")).toEqual({ url: "file:./prisma/dev.db" });
    expect(sanitizeLibsqlUrl("   ")).toEqual({ url: "file:./prisma/dev.db" });
  });

  it("strips sslmode and unsupported query parameters from libsql:// URLs", () => {
    const res = sanitizeLibsqlUrl("libsql://my-database-org.turso.io?sslmode=require&connect_timeout=15");
    expect(res.url).toBe("libsql://my-database-org.turso.io");
    expect(res.authToken).toBeUndefined();
  });

  it("preserves valid libSQL parameters like authToken and tls", () => {
    const res = sanitizeLibsqlUrl("libsql://my-database-org.turso.io?authToken=secret_tok&tls=1&sslmode=require");
    expect(res.url).toBe("libsql://my-database-org.turso.io?tls=1&authToken=secret_tok");
    expect(res.authToken).toBe("secret_tok");
  });

  it("handles https:// Turso URLs and cleans parameters", () => {
    const res = sanitizeLibsqlUrl("https://my-database-org.turso.io?sslmode=disable&authToken=test-token");
    expect(res.url).toBe("https://my-database-org.turso.io/?authToken=test-token");
    expect(res.authToken).toBe("test-token");
  });

  it("cleans query params from file: URLs", () => {
    const res = sanitizeLibsqlUrl("file:./prisma/dev.db?sslmode=require");
    expect(res.url).toBe("file:./prisma/dev.db");
  });

  it("gracefully catches postgresql:// URLs and falls back to local SQLite", () => {
    const res = sanitizeLibsqlUrl("postgresql://user:pass@ep-awesome.us-east-1.aws.neon.tech/neondb?sslmode=require");
    expect(res.url).toBe("file:./prisma/dev.db");
  });
});
