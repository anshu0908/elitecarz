/** Visible marker for anything invented for the pitch demo (BRIEF §14). */
export function DemoTag({ title = "Placeholder for the pitch demo — not real data yet" }: { title?: string }) {
  return (
    <span className="demo-tag" title={title}>
      DEMO
    </span>
  );
}
