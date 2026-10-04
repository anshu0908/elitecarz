"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addNoteAction, updateLeadAction, updateValuationAction } from "@/app/admin/(panel)/leads/actions";
import { toast } from "@/components/admin/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/lib/constants";
import { formatInr } from "@/lib/format";

const LOST_REASONS = ["Bought elsewhere", "Price too high", "Finance not approved", "Car sold to someone else", "Not reachable", "Just browsing", "Other"];

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

export function LeadControls({
  lead,
  users,
  canEdit,
  canAssign,
  currentUserId,
  focusLost,
}: {
  lead: { id: string; status: string; assignedToId: string | null; nextFollowupAt: string | null; lostReason: string | null };
  users: { id: string; name: string }[];
  canEdit: boolean;
  canAssign: boolean;
  currentUserId: string;
  focusLost: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(focusLost ? "lost" : lead.status);
  const [assignee, setAssignee] = useState(lead.assignedToId ?? "");
  const [followup, setFollowup] = useState(toLocalInput(lead.nextFollowupAt));
  const [lostReason, setLostReason] = useState(lead.lostReason ?? "");

  const save = () =>
    start(async () => {
      const res = await updateLeadAction(lead.id, {
        status,
        assignedToId: assignee || null,
        nextFollowupAt: followup ? new Date(followup).toISOString() : null,
        lostReason: status === "lost" ? lostReason || null : null,
      });
      toast(res.ok ? "Lead updated" : res.error, { tone: res.ok ? "ok" : "error" });
      if (res.ok) router.refresh();
    });

  const quick = (hours: number) => setFollowup(toLocalInput(hoursFromNow(hours)));

  return (
    <div className="card sticky top-20 space-y-4 p-5">
      <h2 className="font-extrabold">Pipeline</h2>
      <div>
        <span className="label" id="lead-status-l">Status</span>
        <Dropdown aria-labelledby="lead-status-l" value={status} disabled={!canEdit} onChange={setStatus} options={LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))} />
      </div>
      {status === "lost" && (
        <div>
          <span className="label" id="lead-lost-l">Why was it lost?</span>
          <Dropdown aria-labelledby="lead-lost-l" value={lostReason} onChange={setLostReason} placeholder="Choose a reason" options={LOST_REASONS} />
        </div>
      )}
      <div>
        <span className="label" id="lead-assign-l">Assigned to</span>
        <Dropdown
          aria-labelledby="lead-assign-l"
          value={assignee}
          disabled={!canEdit}
          onChange={setAssignee}
          options={[{ value: "", label: "Unassigned" }, ...users.filter((u) => canAssign || u.id === currentUserId || u.id === lead.assignedToId).map((u) => ({ value: u.id, label: u.name }))]}
        />
      </div>
      <div>
        <label className="block">
          <span className="label">Next follow-up</span>
          <input type="datetime-local" className="field" value={followup} disabled={!canEdit} onChange={(e) => setFollowup(e.target.value)} />
        </label>
        {canEdit && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[["In 2 h", 2], ["Tomorrow", 24], ["In 3 days", 72]].map(([l, h]) => (
              <button key={l} type="button" className="rounded-md border border-line px-2 py-1 text-xs font-semibold hover:border-ink" onClick={() => quick(h as number)}>{l}</button>
            ))}
            {followup && <button type="button" className="px-2 py-1 text-xs text-muted hover:text-text" onClick={() => setFollowup("")}>Clear</button>}
          </div>
        )}
      </div>
      {canEdit && <button type="button" className="btn btn-dark w-full" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save changes"}</button>}
    </div>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addNoteAction(leadId, note);
          if (!res.ok) return toast(res.error, { tone: "error" });
          setNote("");
          router.refresh();
        });
      }}
    >
      <label htmlFor="note" className="sr-only">Add a note</label>
      <input id="note" className="field" placeholder="e.g. Called, coming Saturday 12 pm" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
      <button type="submit" className="btn btn-dark" disabled={pending || !note.trim()}>Add note</button>
    </form>
  );
}

export function ValuationTool({ sellId, canEdit, initial }: { sellId: string; canEdit: boolean; initial: { offeredMin: number | null; offeredMax: number | null; outcome: string | null; inspectionSlot: string | null } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [min, setMin] = useState(initial.offeredMin ? String(initial.offeredMin) : "");
  const [max, setMax] = useState(initial.offeredMax ? String(initial.offeredMax) : "");
  const [outcome, setOutcome] = useState(initial.outcome ?? "");
  const [slot, setSlot] = useState(toLocalInput(initial.inspectionSlot));
  const n = (s: string) => (s ? Number(s.replace(/\D/g, "")) : null);
  return (
    <div className="mt-5 rounded-xl border border-dashed border-line-strong p-4">
      <p className="text-sm font-bold">Valuation</p>
      <p className="text-xs text-muted">Pre-filled from the indicative range shown to the seller. Adjust after inspection.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="label">Offer from (₹)</span><input className="field" inputMode="numeric" value={min} disabled={!canEdit} onChange={(e) => setMin(e.target.value)} />{n(min) && <span className="hint block num">{formatInr(n(min)!)}</span>}</label>
        <label className="block"><span className="label">Offer up to (₹)</span><input className="field" inputMode="numeric" value={max} disabled={!canEdit} onChange={(e) => setMax(e.target.value)} />{n(max) && <span className="hint block num">{formatInr(n(max)!)}</span>}</label>
        <label className="block"><span className="label">Inspection slot</span><input type="datetime-local" className="field" value={slot} disabled={!canEdit} onChange={(e) => setSlot(e.target.value)} /></label>
        <div>
          <span className="label" id="sell-outcome-l">Outcome</span>
          <Dropdown
            aria-labelledby="sell-outcome-l"
            value={outcome}
            disabled={!canEdit}
            onChange={setOutcome}
            options={[
              { value: "", label: "Open" },
              { value: "bought", label: "Bought" },
              { value: "declined_by_us", label: "Declined by us" },
              { value: "declined_by_seller", label: "Seller declined offer" },
            ]}
          />
        </div>
      </div>
      {canEdit && (
        <button
          type="button"
          className="btn btn-dark btn-sm mt-3"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await updateValuationAction(sellId, {
                offeredMin: n(min),
                offeredMax: n(max),
                outcome: outcome || null,
                inspectionSlot: slot && toLocalInput(initial.inspectionSlot) !== slot ? new Date(slot).toISOString() : undefined,
              });
              toast(res.ok ? (slot && toLocalInput(initial.inspectionSlot) !== slot ? "Saved — inspection booked" : "Saved") : res.error, { tone: res.ok ? "ok" : "error" });
              if (res.ok) router.refresh();
            })
          }
        >
          Save valuation
        </button>
      )}
    </div>
  );
}
