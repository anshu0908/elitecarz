import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Audit log" };

const PAGE = 100;

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requirePageUser("audit.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const entity = typeof sp.entity === "string" ? sp.entity : "";
  const where = entity ? { entity } : {};
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { user: { select: { name: true } } } }),
    db.auditLog.count({ where }),
  ]);
  const href = (e: string, p = 1) => `/admin/audit?${new URLSearchParams({ ...(e ? { entity: e } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Audit log</h1>
      <p className="mb-4 mt-1 text-sm text-muted">Every sign-in, edit, price change, publish and delete — who, when, and what changed.</p>
      <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Filter">
        {["", "car", "lead", "user", "setting", "sell_request"].map((e) => (
          <Link key={e || "all"} href={href(e)} aria-current={entity === e ? "page" : undefined} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${entity === e ? "bg-ink text-white" : "bg-card text-muted"}`}>
            {e ? e.replace("_", " ") : "all"}
          </Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-3 font-semibold">When</th><th className="p-3 font-semibold">Who</th><th className="p-3 font-semibold">Action</th><th className="p-3 font-semibold">Item</th><th className="p-3 font-semibold">Details</th><th className="p-3 font-semibold">IP</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="num whitespace-nowrap p-3">{formatDate(r.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", second: "2-digit" })}</td>
                <td className="p-3">{r.user?.name ?? "—"}</td>
                <td className="p-3 font-semibold">{r.action}</td>
                <td className="p-3">
                  {r.entity === "car" && r.entityId ? <Link className="hover:underline" href={`/admin/cars/${r.entityId}`}>car</Link> : r.entity === "lead" && r.entityId ? <Link className="hover:underline" href={`/admin/leads/${r.entityId}`}>lead</Link> : r.entity}
                </td>
                <td className="max-w-[360px] p-3"><code className="line-clamp-3 break-all text-xs text-muted">{r.diff ?? ""}</code></td>
                <td className="num p-3 text-xs text-muted">{r.ip ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="num text-muted">{total} entries</span>
        <span className="flex gap-2">
          {page > 1 && <Link href={href(entity, page - 1)} className="btn btn-outline btn-sm">Newer</Link>}
          {page * PAGE < total && <Link href={href(entity, page + 1)} className="btn btn-outline btn-sm">Older</Link>}
        </span>
      </div>
    </div>
  );
}
