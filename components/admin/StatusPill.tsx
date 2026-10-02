const STYLES: Record<string, string> = {
  draft: "bg-paper text-muted border-line-strong",
  published: "bg-ok-soft text-ok border-ok/25",
  reserved: "bg-warn-soft text-warn border-warn/25",
  sold: "bg-ink text-white border-ink",
  archived: "bg-paper text-muted border-line",
  new: "bg-red-soft text-red border-red/25",
  contacted: "bg-paper text-text border-line-strong",
  visit_scheduled: "bg-warn-soft text-warn border-warn/25",
  negotiating: "bg-demo-soft text-demo border-demo/25",
  won: "bg-ok-soft text-ok border-ok/25",
  lost: "bg-paper text-muted border-line",
  spam: "bg-paper text-muted border-line",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${STYLES[status] ?? STYLES.draft}`}>{label ?? status.replace(/_/g, " ")}</span>;
}
