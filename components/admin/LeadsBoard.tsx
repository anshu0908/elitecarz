"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AlarmClock, Copy, MessageSquareText, Phone, Search } from "lucide-react";
import { updateLeadAction } from "@/app/admin/(panel)/leads/actions";
import { toast } from "@/components/admin/Toast";
import { statusClass } from "@/components/admin/StatusPill";
import { Dropdown } from "@/components/ui/Dropdown";
import { LEAD_STATUS_LABELS, LEAD_STATUSES, LEAD_TYPE_LABELS, LEAD_TYPES, type LeadStatus, type LeadType } from "@/lib/constants";
import { formatDate, formatPhone } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export type LeadCard = {
  id: string; type: string; status: string; name: string | null; phone: string | null; car: string | null; source: string | null;
  assignee: string | null; createdAt: string; nextFollowupAt: string | null; overdue: boolean; notes: number; duplicate: boolean; demo: boolean;
};

const BOARD_COLUMNS: LeadStatus[] = ["new", "contacted", "visit_scheduled", "negotiating", "won", "lost"];

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 60 * 24) return `${Math.round(m / 60)}h ago`;
  return formatDate(iso, { day: "numeric", month: "short" });
}

export function LeadsBoard({
  leads,
  users,
  cars,
  filters,
  canEdit,
}: {
  leads: LeadCard[];
  users: { id: string; name: string }[];
  cars: { id: string; title: string }[];
  filters: { type: string; car: string; assignee: string; source: string; view: string; clicks: boolean };
  canEdit: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, string>>({});

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(window.location.search);
    if (v) p.set(k, v);
    else p.delete(k);
    router.push(`${pathname}?${p.toString()}`);
  };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return leads
      .map((l) => ({ ...l, status: optimistic[l.id] ?? l.status }))
      .filter((l) => !t || `${l.name ?? ""} ${l.phone ?? ""} ${l.car ?? ""}`.toLowerCase().includes(t));
  }, [leads, q, optimistic]);

  function move(id: string, status: LeadStatus) {
    if (status === "lost") {
      router.push(`/admin/leads/${id}?lost=1`);
      return;
    }
    setOptimistic((o) => ({ ...o, [id]: status }));
    start(async () => {
      const res = await updateLeadAction(id, { status });
      if (!res.ok) {
        setOptimistic((o) => {
          const n = { ...o };
          delete n[id];
          return n;
        });
        toast(res.error, { tone: "error" });
      } else toast(`Moved to ${LEAD_STATUS_LABELS[status]}`);
      router.refresh();
    });
  }

  return (
    <div aria-busy={pending}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Search leads</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or car" className="field min-h-10 pl-9 text-sm" />
        </label>
        <Dropdown
          variant="compact"
          aria-label="Type"
          className="min-w-[150px]"
          buttonClassName="min-h-10"
          value={filters.type}
          onChange={(v) => setParam("type", v)}
          options={[{ value: "", label: "All types" }, ...LEAD_TYPES.map((t) => ({ value: t, label: LEAD_TYPE_LABELS[t] }))]}
        />
        <Dropdown
          variant="compact"
          aria-label="Car"
          className="w-[220px]"
          buttonClassName="min-h-10"
          value={filters.car}
          onChange={(v) => setParam("car", v)}
          options={[{ value: "", label: "All cars" }, ...cars.map((c) => ({ value: c.id, label: c.title }))]}
        />
        <Dropdown
          variant="compact"
          aria-label="Assignee"
          className="min-w-[150px]"
          buttonClassName="min-h-10"
          value={filters.assignee}
          onChange={(v) => setParam("assignee", v)}
          options={[{ value: "", label: "Anyone" }, { value: "none", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
        />
        <label className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
          <input type="checkbox" className="accent-[var(--color-red)]" checked={filters.clicks} onChange={(e) => setParam("clicks", e.target.checked ? "1" : "")} /> WhatsApp clicks
        </label>
        <div className="flex rounded-lg border border-line bg-card p-0.5 text-sm font-semibold" role="group" aria-label="View">
          {["board", "list"].map((v) => (
            <button key={v} type="button" aria-pressed={filters.view === v} onClick={() => setParam("view", v === "board" ? "" : v)} className={`rounded-md px-3 py-1.5 capitalize ${filters.view === v ? "bg-ink text-white" : ""}`}>{v}</button>
          ))}
        </div>
      </div>

      {filters.view === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3 font-semibold">Lead</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Car</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Assigned</th>
                <th className="p-3 font-semibold">Follow-up</th>
                <th className="p-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id} className="border-t border-line hover:bg-paper/60">
                  <td className="p-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-semibold hover:underline">{l.name ?? "Anonymous"}</Link>
                    {l.phone && <span className="num block text-xs text-muted">{formatPhone(l.phone)}</span>}
                  </td>
                  <td className="p-3">{LEAD_TYPE_LABELS[l.type as LeadType] ?? l.type}</td>
                  <td className="max-w-[220px] truncate p-3">{l.car ?? "—"}</td>
                  <td className="p-3">
                    <Dropdown
                      variant="ghost"
                      aria-label={`Status of ${l.name ?? "lead"}`}
                      className="w-[150px]"
                      buttonClassName={`rounded-full ${statusClass(l.status)}`}
                      disabled={!canEdit}
                      value={l.status}
                      onChange={(v) => move(l.id, v as LeadStatus)}
                      options={LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))}
                    />
                  </td>
                  <td className="p-3">{l.assignee ?? <span className="text-muted">—</span>}</td>
                  <td className="p-3"><FollowUp at={l.nextFollowupAt} overdue={l.overdue} /></td>
                  <td className="p-3 text-muted">{ago(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-8 text-center text-muted">No leads match.</p>}
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          <div className="grid min-w-[1080px] grid-cols-6 gap-3">
            {BOARD_COLUMNS.map((col) => {
              const items = list.filter((l) => l.status === col);
              return (
                <section
                  key={col}
                  aria-label={LEAD_STATUS_LABELS[col]}
                  onDragOver={(e) => canEdit && dragId && e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId) move(dragId, col);
                    setDragId(null);
                  }}
                  className="flex min-h-[300px] flex-col rounded-xl bg-[#ebe9e3] p-2"
                >
                  <h2 className="flex items-center justify-between px-1.5 pb-2 pt-1 text-sm font-bold" style={{ fontStretch: "100%" }}>
                    {LEAD_STATUS_LABELS[col]} <span className="num rounded-full bg-card px-2 text-xs">{items.length}</span>
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {items.map((l) => (
                      <li
                        key={l.id}
                        draggable={canEdit}
                        onDragStart={() => setDragId(l.id)}
                        onDragEnd={() => setDragId(null)}
                        className={`rounded-lg border bg-card p-3 text-sm shadow-sm ${l.status === "new" ? "border-red/40" : "border-line"} ${dragId === l.id ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/admin/leads/${l.id}`} className="font-semibold leading-tight hover:underline">{l.name ?? "Anonymous"}</Link>
                          <span className="shrink-0 text-xs text-muted">{ago(l.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-red">{LEAD_TYPE_LABELS[l.type as LeadType] ?? l.type}</p>
                        {l.car && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{l.car}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          {l.assignee && <span className="chip">{l.assignee.replace(" (demo)", "")}</span>}
                          {l.notes > 0 && <span className="flex items-center gap-0.5"><MessageSquareText className="size-3" aria-hidden />{l.notes}</span>}
                          {l.duplicate && <span className="flex items-center gap-0.5 text-warn" title="Same phone as an earlier lead"><Copy className="size-3" aria-hidden />repeat</span>}
                          {l.demo && <span className="demo-tag">DEMO</span>}
                          <FollowUp at={l.nextFollowupAt} overdue={l.overdue} />
                        </div>
                        {l.phone && (
                          <div className="mt-2 flex gap-1.5">
                            <a href={whatsappLink(l.phone, `Hi ${l.name ?? ""}, this is EliteCarz${l.car ? ` about the ${l.car}` : ""}.`)} target="_blank" rel="noopener" className="btn btn-wa btn-sm min-h-8 flex-1 px-2 text-xs">WhatsApp</a>
                            <a href={telLink(l.phone)} className="btn btn-outline btn-sm min-h-8 px-2" aria-label={`Call ${l.name ?? "lead"}`}><Phone className="size-3.5" aria-hidden /></a>
                          </div>
                        )}
                        {canEdit && (
                          <div className="mt-2">
                            <Dropdown
                              variant="ghost"
                              className="w-full"
                              buttonClassName={`rounded-full ${statusClass(l.status)}`}
                              aria-label={`Move ${l.name ?? "lead"} to`}
                              value={l.status}
                              onChange={(v) => move(l.id, v as LeadStatus)}
                              options={LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          {list.some((l) => l.status === "spam") && (
            <p className="mt-2 text-xs text-muted">{list.filter((l) => l.status === "spam").length} spam lead(s) hidden — switch to list view to see them.</p>
          )}
        </div>
      )}
    </div>
  );
}

function FollowUp({ at, overdue }: { at: string | null; overdue: boolean }) {
  if (!at) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${overdue ? "font-semibold text-bad" : "text-muted"}`}>
      <AlarmClock className="size-3" aria-hidden /> {overdue ? "Overdue" : formatDate(at, { day: "numeric", month: "short", hour: "numeric" })}
    </span>
  );
}

