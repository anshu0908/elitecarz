import { AlertTriangle, CheckCircle2, ChevronDown, MinusCircle, XCircle } from "lucide-react";
import { summariseInspection } from "@/lib/inspection";
import { formatDate } from "@/lib/format";
import { DemoTag } from "@/components/ui/Demo";
import type { PublicCarDetail } from "@/lib/types";

const RESULT = {
  pass: { icon: CheckCircle2, cls: "text-ok", label: "Pass" },
  minor: { icon: AlertTriangle, cls: "text-warn", label: "Minor" },
  fail: { icon: XCircle, cls: "text-bad", label: "Fail" },
  na: { icon: MinusCircle, cls: "text-muted", label: "N/A" },
} as const;

export function InspectionReport({ inspection }: { inspection: NonNullable<PublicCarDetail["inspection"]> }) {
  const s = summariseInspection(inspection.items);
  return (
    <div>
      {inspection.isDemo && (
        <p className="mb-4 rounded-lg bg-demo-soft px-3 py-2 text-sm text-demo">
          <strong>DEMO report.</strong> Shows the format only — results are placeholders until the dealer&apos;s real checklist is loaded.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Score" value={`${s.score}/10`} />
        <Stat label="Checked" value={String(s.checked)} />
        <Stat label="Minor issues" value={String(s.minor)} tone={s.minor ? "warn" : undefined} />
        <Stat label="Failed" value={String(s.failed)} tone={s.failed ? "bad" : undefined} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {inspection.inspectedBy && <>Inspected by {inspection.inspectedBy}</>}
        {inspection.inspectedOn && <> on {formatDate(inspection.inspectedOn)}</>}. {inspection.summary}
      </p>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
        {s.sections.map((sec) => (
          <details key={sec.section} className="group px-4 [&_summary::-webkit-details-marker]:hidden" open={sec.minor + sec.fail > 0}>
            <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5">
              <span className="flex-1 font-semibold">{sec.section}</span>
              <span className="num text-sm text-muted">
                {sec.pass}/{sec.pass + sec.minor + sec.fail} pass
              </span>
              {sec.minor + sec.fail > 0 && <span className="chip border-warn/30 bg-warn-soft text-warn">{sec.minor + sec.fail} to note</span>}
              <ChevronDown className="size-5 text-muted transition group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="grid gap-x-6 pb-4 text-sm sm:grid-cols-2">
              {sec.items.map((it) => {
                const r = RESULT[it.result as keyof typeof RESULT] ?? RESULT.na;
                const Icon = r.icon;
                return (
                  <li key={it.item} className="flex items-start gap-2 py-1.5">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${r.cls}`} aria-hidden />
                    <span>
                      {it.item}
                      <span className="sr-only">: {r.label}</span>
                      {it.note && <span className="block text-xs text-muted">{it.note}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "bad" }) {
  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`num mt-1 font-display text-2xl font-bold ${tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : ""}`}>{value}</p>
    </div>
  );
}

export function NoInspection() {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-card p-5 text-sm">
      <p className="font-semibold">Report being uploaded</p>
      <p className="mt-1 text-muted">
        The itemised inspection report for this car isn&apos;t online yet. Ask for it on WhatsApp and we&apos;ll send it before you visit. <DemoTag title="In the live site every car would have its report" />
      </p>
    </div>
  );
}
