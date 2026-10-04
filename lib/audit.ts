import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function audit(userId: string | null, action: string, entity: string, entityId?: string | null, diff?: unknown) {
  let ip: string | null = null;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
  } catch {
    /* outside a request */
  }
  try {
    const validUserId = userId?.startsWith("demo-") ? null : userId;
    await db.auditLog.create({
      data: { userId: validUserId, action, entity, entityId: entityId ?? null, diff: diff === undefined ? null : JSON.stringify(diff), ip },
    });
  } catch (err) {
    console.warn("audit: skipped audit logging:", err instanceof Error ? err.message : err);
  }
}

/** Field-level diff for audit entries: { field: [before, after] }. */
export function diffFields<T extends Record<string, unknown>>(before: T, after: Partial<T>): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  for (const k of Object.keys(after)) {
    const a = before[k];
    const b = after[k];
    const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
    if (JSON.stringify(norm(a)) !== JSON.stringify(norm(b))) out[k] = [norm(a), norm(b)];
  }
  return out;
}
