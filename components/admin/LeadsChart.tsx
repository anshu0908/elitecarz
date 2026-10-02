"use client";
import { useState } from "react";
import { formatDate } from "@/lib/format";

/**
 * Single-series bar chart (leads per day). One ink hue, no legend (the title names
 * the series), thin bars with 4px rounded data-ends, 2px gaps, hover tooltip with a
 * hit target taller than the bar, and a table view for screen readers.
 */
export function LeadsChart({ days }: { days: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...days.map((d) => d.count));
  const ticks = [0, Math.ceil(max / 2), max];
  const H = 160;
  const label = (iso: string) => formatDate(iso, { day: "numeric", month: "short" });

  return (
    <figure className="mt-4">
      <div className="relative flex gap-2" aria-hidden>
        <div className="num flex flex-col-reverse justify-between pb-6 text-right text-[0.7rem] text-muted" style={{ height: H + 24 }}>
          {ticks.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: H }}>
            {ticks.map((t) => <div key={t} className="border-t border-line" />)}
          </div>
          <div className="relative flex items-end gap-[2px]" style={{ height: H }}>
            {days.map((d, i) => (
              <div key={d.date} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div
                  className={`w-full max-w-[22px] rounded-t-[4px] transition-colors ${hover === i ? "bg-red" : "bg-ink"}`}
                  style={{ height: d.count ? `${(d.count / max) * 100}%` : 2, opacity: d.count ? 1 : 0.25 }}
                />
                {hover === i && (
                  <div className="num pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white shadow">
                    {label(d.date)}: <strong>{d.count}</strong> lead{d.count === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-[2px] text-[0.65rem] text-muted">
            {days.map((d, i) => (
              <span key={d.date} className="flex-1 text-center">{i % 3 === 0 || i === days.length - 1 ? label(d.date) : ""}</span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        <table>
          <caption>Leads per day</caption>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}><th scope="row">{label(d.date)}</th><td>{d.count}</td></tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
