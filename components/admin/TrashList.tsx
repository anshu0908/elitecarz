"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { bulkCarAction } from "@/app/admin/(panel)/cars/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/admin/Toast";
import { daysSince, formatDate, formatLakh } from "@/lib/format";

type Row = { id: string; title: string; stockNo: string | null; priceInr: number; deletedAt: string; redirect: string | null; slug: string };

export function TrashList({ rows, canPurge }: { rows: Row[]; canPurge: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [purge, setPurge] = useState<Row | null>(null);
  if (!rows.length) return <div className="card p-10 text-center text-muted">Trash is empty.</div>;
  return (
    <>
      <ul className="divide-y divide-line rounded-xl border border-line bg-card" aria-busy={pending}>
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.title}</p>
              <p className="num text-xs text-muted">
                {r.stockNo} · {formatLakh(r.priceInr)} · deleted {formatDate(r.deletedAt)} · {Math.max(0, 30 - daysSince(r.deletedAt))} days left
                {r.redirect && <> · /cars/{r.slug} → {r.redirect}</>}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                start(async () => {
                  const res = await bulkCarAction([r.id], "restore");
                  toast(res.ok ? `Restored ${r.title}` : res.error, { tone: res.ok ? "ok" : "error" });
                  router.refresh();
                })
              }
            >
              <RotateCcw className="size-4" aria-hidden /> Restore
            </button>
            {canPurge && (
              <button type="button" className="btn btn-sm text-bad hover:bg-red-soft" onClick={() => setPurge(r)}>
                <Trash2 className="size-4" aria-hidden /> Delete forever
              </button>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!purge}
        title="Delete forever?"
        body={<>This permanently removes <strong>{purge?.title}</strong>, its photos list and inspection report. Leads that mention it are kept. This can&apos;t be undone.</>}
        confirmLabel="Delete forever"
        danger
        onCancel={() => setPurge(null)}
        onConfirm={() => {
          const r = purge!;
          setPurge(null);
          start(async () => {
            const res = await bulkCarAction([r.id], "purge");
            toast(res.ok ? "Permanently deleted" : res.error, { tone: res.ok ? "ok" : "error" });
            router.refresh();
          });
        }}
      />
    </>
  );
}
