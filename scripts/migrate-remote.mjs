// Applies prisma/migrations/*/migration.sql to a remote libSQL/Turso database.
// (`prisma migrate deploy` only targets local SQLite files.) Safe to re-run: applied
// migrations are recorded in a _app_migrations table and skipped.
//
// Usage (PowerShell):
//   $env:DATABASE_URL="libsql://<db>-<org>.turso.io"; $env:DATABASE_AUTH_TOKEN="<token>"; npm run db:remote:migrate
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl?.startsWith("libsql://") && !rawUrl?.startsWith("https://")) {
  console.error("Set DATABASE_URL to your libsql:// Turso URL (and DATABASE_AUTH_TOKEN) first.");
  process.exit(1);
}

// Strip unsupported query parameters like ?sslmode=...
let cleanUrl = rawUrl;
let token = process.env.DATABASE_AUTH_TOKEN;
try {
  const p = new URL(rawUrl);
  if (!token && p.searchParams.get("authToken")) {
    token = p.searchParams.get("authToken") || undefined;
  }
  const tls = p.searchParams.get("tls");
  const sp = new URLSearchParams();
  if (tls !== null) sp.set("tls", tls);
  if (token) sp.set("authToken", token);
  p.search = sp.toString() ? `?${sp.toString()}` : "";
  cleanUrl = p.toString();
} catch {
  cleanUrl = rawUrl.split("?")[0];
}

const db = createClient({ url: cleanUrl, authToken: token });
await db.execute("CREATE TABLE IF NOT EXISTS _app_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const done = new Set((await db.execute("SELECT name FROM _app_migrations")).rows.map((r) => r.name));

const dir = new URL("../prisma/migrations/", import.meta.url);
const names = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
for (const name of names) {
  if (done.has(name)) {
    console.log(`skip  ${name}`);
    continue;
  }
  const sql = readFileSync(new URL(`${name}/migration.sql`, dir), "utf8");
  await db.executeMultiple(sql);
  await db.execute({ sql: "INSERT INTO _app_migrations (name, applied_at) VALUES (?, ?)", args: [name, new Date().toISOString()] });
  console.log(`apply ${name}`);
}
console.log("Remote database is up to date.");
