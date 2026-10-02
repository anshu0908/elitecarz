import { formatDate, formatInr } from "@/lib/format";

export function CarActivity({ prices, audits }: { prices: { id: number; oldPrice: number; newPrice: number; by: string; at: string }[]; audits: { id: number; action: string; by: string; at: string; diff: string | null }[] }) {
  const when = (d: string) => formatDate(d, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Activity history">
      <div className="card p-5">
        <h2 className="font-extrabold">Price history</h2>
        {prices.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No price changes yet.</p>
        ) : (
          <ul className="num mt-3 space-y-2 text-sm">
            {prices.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 border-b border-line pb-2">
                <span><s className="text-muted">{formatInr(p.oldPrice)}</s> → <strong>{formatInr(p.newPrice)}</strong></span>
                <span className="text-muted">{p.by} · {when(p.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card p-5">
        <h2 className="font-extrabold">Activity</h2>
        {audits.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No activity recorded yet.</p>
        ) : (
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
            {audits.map((a) => (
              <li key={a.id} className="border-b border-line pb-2">
                <span className="font-semibold capitalize">{a.action.replace(/[_:]/g, " ")}</span> <span className="text-muted">by {a.by} · {when(a.at)}</span>
                {a.diff && a.action === "update" && <DiffSummary diff={a.diff} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DiffSummary({ diff }: { diff: string }) {
  let keys: string[] = [];
  try {
    keys = Object.keys(JSON.parse(diff)).filter((k) => k !== "updatedById");
  } catch {
    /* ignore */
  }
  if (!keys.length) return null;
  return <span className="block text-xs text-muted">Changed: {keys.slice(0, 8).join(", ")}{keys.length > 8 ? "…" : ""}</span>;
}
