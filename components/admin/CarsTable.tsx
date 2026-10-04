"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Copy, ExternalLink, ImageOff, LayoutGrid, MoreHorizontal, Pencil, Rows3, Search, Star, Trash2 } from "lucide-react";
import { bulkCarAction, duplicateCarAction, inlineUpdateAction } from "@/app/admin/(panel)/cars/actions";
import { toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusPill, statusClass } from "@/components/admin/StatusPill";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatDate, formatInr, formatKm, formatLakh } from "@/lib/format";
import { CAR_STATUSES, type CarStatus } from "@/lib/constants";
import type { BulkAction } from "@/lib/admin/cars-service";

export type AdminCarRow = {
  id: string;
  slug: string;
  stockNo: string | null;
  title: string;
  status: string;
  make: string;
  year: number;
  fuel: string;
  transmission: string;
  kmDriven: number | null;
  priceInr: number;
  featured: boolean;
  badge: string | null;
  views: number;
  regNumber: string | null;
  hero: string | null;
  photoCount: number;
  leadCount: number;
  daysInStock: number;
  updatedAt: string;
  margin: number | null;
};

type Perms = { edit: boolean; publish: boolean; delete: boolean; viewCost: boolean };
type SortKey = "updated" | "price" | "days" | "views";

export function CarsTable({ rows, initialStatus, perms }: { rows: AdminCarRow[]; initialStatus: string; perms: Perms }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [make, setMake] = useState("");
  const [missingPhotos, setMissingPhotos] = useState(false);
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [rows]);
  const makes = useMemo(() => [...new Set(rows.map((r) => r.make))].sort(), [rows]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/\s/g, "");
    const out = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!make || r.make === make) &&
        (!missingPhotos || r.photoCount === 0) &&
        (!term || `${r.title}${r.stockNo ?? ""}${r.regNumber ?? ""}`.toLowerCase().replace(/\s/g, "").includes(term)),
    );
    const by: Record<SortKey, (a: AdminCarRow, b: AdminCarRow) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      price: (a, b) => b.priceInr - a.priceInr,
      days: (a, b) => b.daysInStock - a.daysInStock,
      views: (a, b) => b.views - a.views,
    };
    return out.sort(by[sort]);
  }, [rows, q, status, make, missingPhotos, sort]);

  const allSelected = list.length > 0 && list.every((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  function run(ids: string[], action: BulkAction, label: string) {
    startTransition(async () => {
      const res = await bulkCarAction(ids, action);
      if (!res.ok) return toast(res.error, { tone: "error" });
      setSelected(new Set());
      if (action === "delete") {
        toast(`${res.count} car${res.count === 1 ? "" : "s"} moved to Trash`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const r = await bulkCarAction(ids, "restore");
              toast(r.ok ? "Restored" : r.error, { tone: r.ok ? "ok" : "error" });
              router.refresh();
            },
          },
        });
      } else {
        toast(`${label}: ${res.count} car${res.count === 1 ? "" : "s"}${res.count < ids.length ? ` (${ids.length - res.count} skipped — publishing needs photos)` : ""}`);
      }
      router.refresh();
    });
  }

  function inline(id: string, patch: { priceInr?: number; status?: CarStatus; featured?: boolean }) {
    startTransition(async () => {
      const res = await inlineUpdateAction(id, patch);
      toast(res.ok ? "Saved" : res.error, { tone: res.ok ? "ok" : "error" });
      router.refresh();
    });
  }

  const ids = [...selected];

  return (
    <div aria-busy={pending}>
      {/* Status tabs */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div role="tablist" aria-label="Filter by status" className="flex gap-1.5">
          {["all", ...CAR_STATUSES].map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize ${status === s ? "bg-ink text-white" : "bg-card text-muted hover:text-text"}`}
            >
              {s} <span className="num opacity-70">{counts[s] ?? 0}</span>
            </button>
          ))}
          <Link href="/admin/trash" className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted hover:text-text">Trash →</Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search cars</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, stock no. or reg no." className="field min-h-10 pl-9 text-sm" />
        </label>
        <Dropdown
          variant="compact"
          aria-label="Make"
          className="min-w-[150px]"
          buttonClassName="min-h-10"
          value={make}
          onChange={setMake}
          options={[{ value: "", label: "All makes" }, ...makes.map((m) => ({ value: m, label: m }))]}
        />
        <Dropdown
          variant="compact"
          aria-label="Sort"
          className="min-w-[180px]"
          buttonClassName="min-h-10"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={[
            { value: "updated", label: "Recently updated" },
            { value: "price", label: "Price (high first)" },
            { value: "days", label: "Days in stock" },
            { value: "views", label: "Most viewed" },
          ]}
        />
        <label className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
          <input type="checkbox" checked={missingPhotos} onChange={(e) => setMissingPhotos(e.target.checked)} className="accent-[var(--color-red)]" /> Missing photos
        </label>
        <div className="flex rounded-lg border border-line bg-card p-0.5" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`grid size-9 place-items-center rounded-md ${view === "table" ? "bg-ink text-white" : ""}`} aria-label="Table view"><Rows3 className="size-4" /></button>
          <button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={`grid size-9 place-items-center rounded-md ${view === "cards" ? "bg-ink text-white" : ""}`} aria-label="Card view"><LayoutGrid className="size-4" /></button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="sticky top-14 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm text-white lg:top-2">
          <span className="num mr-2 font-semibold">{selected.size} selected</span>
          {perms.publish && (
            <>
              <BulkBtn onClick={() => run(ids, "publish", "Published")}>Publish</BulkBtn>
              <BulkBtn onClick={() => run(ids, "unpublish", "Moved to draft")}>Unpublish</BulkBtn>
              <BulkBtn onClick={() => run(ids, "reserve", "Reserved")}>Reserved</BulkBtn>
              <BulkBtn onClick={() => run(ids, "sold", "Sold")}>Sold</BulkBtn>
              <BulkBtn onClick={() => run(ids, "feature", "Featured")}>Feature</BulkBtn>
              <BulkBtn onClick={() => run(ids, "archive", "Archived")}>Archive</BulkBtn>
            </>
          )}
          {perms.delete && <BulkBtn onClick={() => setConfirmDelete(ids)} danger>Delete</BulkBtn>}
          <a href={`/api/admin/export/cars?ids=${ids.join(",")}`} className="rounded-md px-2.5 py-1.5 hover:bg-white/10">Export</a>
          <button type="button" className="ml-auto rounded-md px-2.5 py-1.5 text-white/70 hover:text-white" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card p-10 text-center text-muted">No cars match.</div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="num w-full min-w-[980px] text-sm">
            <thead className="whitespace-nowrap bg-paper text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="w-10 p-3">
                  <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(list.map((r) => r.id)))} className="size-4 accent-[var(--color-red)]" />
                </th>
                <th className="p-3 font-semibold">Car</th>
                <th className="p-3 font-semibold">Specs</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-center font-semibold" title="Featured">★</th>
                <th className="p-3 font-semibold">Days</th>
                <th className="p-3 font-semibold">Views · Leads</th>
                {perms.viewCost && <th className="p-3 font-semibold">Margin</th>}
                <th className="p-3 font-semibold">Updated</th>
                <th className="p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className={`border-t border-line ${selected.has(r.id) ? "bg-red-soft/40" : "hover:bg-paper/60"}`}>
                  <td className="p-3">
                    <input type="checkbox" aria-label={`Select ${r.title}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="size-4 accent-[var(--color-red)]" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Thumb src={r.hero} />
                      <div className="min-w-0">
                        <Link href={`/admin/cars/${r.id}`} className="block max-w-[260px] truncate font-semibold hover:underline">{r.title}</Link>
                        <span className="text-xs text-muted">{r.stockNo} · {r.photoCount} photos</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted">{r.fuel} · {r.transmission}<br />{r.kmDriven != null ? formatKm(r.kmDriven) : "—"}</td>
                  <td className="p-3">
                    <PriceCell value={r.priceInr} disabled={!perms.edit || (!perms.publish && r.status !== "draft")} onSave={(v) => inline(r.id, { priceInr: v })} />
                  </td>
                  <td className="p-3">
                    <Dropdown
                      variant="ghost"
                      aria-label={`Status of ${r.title}`}
                      className="w-[120px]"
                      buttonClassName={`capitalize rounded-full ${statusClass(r.status)}`}
                      value={r.status}
                      disabled={!perms.publish}
                      onChange={(v) => inline(r.id, { status: v as CarStatus })}
                      options={CAR_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button type="button" disabled={!perms.publish} onClick={() => inline(r.id, { featured: !r.featured })} aria-pressed={r.featured} aria-label={r.featured ? "Unfeature" : "Feature"} className="grid size-8 place-items-center rounded-md hover:bg-paper disabled:opacity-40">
                      <Star className={`size-4 ${r.featured ? "fill-amber-400 text-amber-500" : "text-muted"}`} aria-hidden />
                    </button>
                  </td>
                  <td className={`p-3 ${r.daysInStock > 60 ? "font-semibold text-bad" : r.daysInStock > 45 ? "text-warn" : ""}`}>{r.daysInStock}</td>
                  <td className="p-3">{r.views} / {r.leadCount}</td>
                  {perms.viewCost && <td className={`p-3 ${r.margin != null && r.margin < 0 ? "text-bad" : ""}`}>{r.margin != null ? formatLakh(r.margin) : "—"}</td>}
                  <td className="p-3 text-muted">{formatDate(r.updatedAt, { day: "numeric", month: "short" })}</td>
                  <td className="p-3">
                    <RowMenu row={r} perms={perms} onDuplicate={() => startTransition(async () => {
                      const res = await duplicateCarAction(r.id);
                      if (!res.ok) return toast(res.error, { tone: "error" });
                      toast("Duplicated as a draft");
                      router.push(`/admin/cars/${res.id}`);
                    })} onDelete={() => setConfirmDelete([r.id])} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <li key={r.id} className="card flex gap-3 p-3">
              <input type="checkbox" aria-label={`Select ${r.title}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="mt-1 size-4 shrink-0 accent-[var(--color-red)]" />
              <Thumb src={r.hero} large />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/cars/${r.id}`} className="line-clamp-2 text-sm font-semibold hover:underline">{r.title}</Link>
                <p className="num mt-0.5 text-xs text-muted">{r.stockNo} · {r.daysInStock} days · {r.views} views</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="num font-bold">{formatLakh(r.priceInr)}</span>
                  <StatusPill status={r.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Move ${confirmDelete?.length === 1 ? "this car" : `${confirmDelete?.length} cars`} to Trash?`}
        body="It disappears from the website straight away and its link redirects to the brand page. You can restore it from Trash for 30 days."
        confirmLabel="Move to Trash"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          const ids = confirmDelete!;
          setConfirmDelete(null);
          run(ids, "delete", "Deleted");
        }}
      />
    </div>
  );
}

function BulkBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-md px-2.5 py-1.5 font-semibold hover:bg-white/10 ${danger ? "text-red-on-dark" : ""}`}>
      {children}
    </button>
  );
}

function Thumb({ src, large }: { src: string | null; large?: boolean }) {
  const cls = large ? "h-16 w-20" : "h-11 w-14";
  return src ? (
    <Image src={src} alt="" width={large ? 160 : 112} height={large ? 128 : 88} className={`${cls} shrink-0 rounded-md object-cover`} />
  ) : (
    <span className={`${cls} grid shrink-0 place-items-center rounded-md bg-paper text-muted`} title="No photos">
      <ImageOff className="size-4" aria-label="No photos" />
    </span>
  );
}

function PriceCell({ value, onSave, disabled }: { value: number; onSave: (v: number) => void; disabled: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  if (!editing || disabled) {
    return (
      <button type="button" disabled={disabled} onClick={() => { setDraft(String(value)); setEditing(true); }} className="rounded px-1 py-0.5 text-left font-semibold hover:bg-paper disabled:cursor-default disabled:hover:bg-transparent" title={disabled ? undefined : "Click to edit"}>
        {formatInr(value)}
      </button>
    );
  }
  const commit = () => {
    setEditing(false);
    const v = Number(draft.replace(/\D/g, ""));
    if (v && v !== value) onSave(v);
  };
  return (
    <input
      autoFocus
      aria-label="Price in rupees"
      inputMode="numeric"
      className="w-28 rounded-md border border-ink px-2 py-1 text-sm"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

function RowMenu({ row, perms, onDuplicate, onDelete }: { row: AdminCarRow; perms: Perms; onDuplicate: () => void; onDelete: () => void }) {
  return (
    <details className="relative">
      <summary className="grid size-8 cursor-pointer list-none place-items-center rounded-md hover:bg-paper [&::-webkit-details-marker]:hidden" aria-label={`Actions for ${row.title}`}>
        <MoreHorizontal className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-line bg-card p-1 text-sm shadow-[var(--shadow-pop)]">
        <Link href={`/admin/cars/${row.id}`} className="flex items-center gap-2 rounded px-2.5 py-2 hover:bg-paper"><Pencil className="size-4" /> Edit</Link>
        <a href={row.status === "draft" || row.status === "archived" ? `/admin/cars/${row.id}/preview` : `/cars/${row.slug}`} target="_blank" className="flex items-center gap-2 rounded px-2.5 py-2 hover:bg-paper"><ExternalLink className="size-4" /> {row.status === "draft" || row.status === "archived" ? "Preview" : "View on site"}</a>
        {perms.edit && <button type="button" onClick={onDuplicate} className="flex w-full items-center gap-2 rounded px-2.5 py-2 hover:bg-paper"><Copy className="size-4" /> Duplicate</button>}
        {perms.delete && <button type="button" onClick={onDelete} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-bad hover:bg-red-soft"><Trash2 className="size-4" /> Delete</button>}
      </div>
    </details>
  );
}
