"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { CompareTray } from "@/components/cars/CompareTray";
import { Modal } from "@/components/ui/Modal";
import { Dropdown } from "@/components/ui/Dropdown";
import { WantedForm } from "@/components/forms/WantedForm";
import { applyFilters, countActive, EMPTY_FILTERS, filtersToParams, SORT_LABELS, transmissionGroup, type Filters, type SortKey } from "@/lib/filters";
import { formatKm, formatLakh } from "@/lib/format";
import { RTO_STATE_NAMES } from "@/lib/constants";
import { track } from "@/lib/client/analytics";
import type { FinanceSettings, BookingSettings } from "@/lib/settings-defaults";
import type { PublicCar } from "@/lib/types";

const PRICE_STEPS = [3, 5, 7, 8, 10, 12, 15, 18, 20, 25, 30, 40].map((l) => l * 1_00_000);
const KM_STEPS = [20_000, 40_000, 60_000, 80_000, 1_00_000];

export function InventoryView({
  cars,
  initial,
  finance,
  booking,
  syncUrl = true,
}: {
  cars: PublicCar[];
  initial: Filters;
  finance: FinanceSettings;
  booking: BookingSettings;
  syncUrl?: boolean;
}) {
  const [f, setF] = useState<Filters>(initial);
  const [sheetOpen, setSheetOpen] = useState(false);
  const results = useMemo(() => applyFilters(cars, f), [cars, f]);
  const active = countActive(f);

  // Keep the URL shareable without a server round-trip (Next syncs native history with the router).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (syncUrl) {
      const qs = filtersToParams(f).toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    }
    const t = setTimeout(() => track("filter_use", { active_filters: countActive(f), results: results.length }), 600);
    return () => clearTimeout(t);
  }, [f, syncUrl, results.length]);

  const facets = useMemo(() => {
    const avail = cars.filter((c) => c.status !== "sold");
    const uniq = (xs: (string | null)[]) => [...new Set(xs.filter(Boolean) as string[])].sort();
    return {
      makes: uniq(avail.map((c) => c.make)),
      bodies: uniq(avail.map((c) => c.bodyType)),
      fuels: uniq(avail.map((c) => c.fuel)),
      rtos: uniq(avail.map((c) => (c.rto ?? "").slice(0, 2).toUpperCase())),
      years: [...new Set(avail.map((c) => c.year))].sort((a, b) => b - a),
    };
  }, [cars]);

  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));
  const toggle = (key: "make" | "body" | "fuel" | "trans" | "rto", v: string) =>
    setF((cur) => ({ ...cur, [key]: cur[key].includes(v) ? cur[key].filter((x) => x !== v) : [...cur[key], v] }));

  const chips: { label: string; clear: () => void }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: () => set({ q: "" }) });
  if (f.minPrice != null || f.maxPrice != null)
    chips.push({
      label: `${f.minPrice != null ? formatLakh(f.minPrice) : "Any"} – ${f.maxPrice != null ? formatLakh(f.maxPrice) : "Any"}`,
      clear: () => set({ minPrice: null, maxPrice: null }),
    });
  (["make", "body", "fuel", "trans", "rto"] as const).forEach((k) => f[k].forEach((v) => chips.push({ label: k === "rto" ? `${v} registered` : v, clear: () => toggle(k, v) })));
  if (f.owners != null) chips.push({ label: f.owners === 1 ? "1st owner" : `Up to ${f.owners} owners`, clear: () => set({ owners: null }) });
  if (f.minYear != null) chips.push({ label: `${f.minYear} or newer`, clear: () => set({ minYear: null }) });
  if (f.maxKm != null) chips.push({ label: `Under ${formatKm(f.maxKm)}`, clear: () => set({ maxKm: null }) });

  const panel = (
    <FilterPanel f={f} set={set} toggle={toggle} facets={facets} cars={cars} />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2">{panel}</div>
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="num mr-auto text-sm text-muted" aria-live="polite">
            <strong className="text-text">{results.filter((c) => c.status !== "sold").length}</strong> cars
            {results.some((c) => c.status === "sold") && <> · {results.filter((c) => c.status === "sold").length} recently sold</>}
          </p>
          <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden /> Filters{active ? ` (${active})` : ""}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted" id="sort-label">Sort</span>
            <Dropdown
              variant="compact"
              aria-labelledby="sort-label"
              className="min-w-[190px]"
              value={f.sort}
              onChange={(v) => set({ sort: v as SortKey })}
              options={Object.entries(SORT_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mb-5 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-3" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => setF({ ...EMPTY_FILTERS, sort: f.sort })} className="px-2 py-1.5 text-xs font-semibold text-red hover:underline">
                Clear all
              </button>
            </li>
          </ul>
        )}

        <h2 className="sr-only">Results</h2>
        {results.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c, i) => (
              <li key={c.id}>
                <CarCard car={c} finance={finance} priority={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mx-auto max-w-xl p-6 text-center md:p-8">
            <h2 className="text-xl font-extrabold">Nothing matches — yet</h2>
            <p className="mt-2 text-muted">Stock changes every week. Tell us what you&apos;re after and we&apos;ll WhatsApp you when one comes in.</p>
            <WantedForm summary={chips.map((c) => c.label).join(", ")} booking={booking} />
            <button type="button" onClick={() => setF({ ...EMPTY_FILTERS })} className="mt-4 text-sm font-semibold text-red hover:underline">
              Or clear all filters
            </button>
          </div>
        )}
      </div>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
        {panel}
        <div className="sticky bottom-0 -mx-5 mt-4 flex gap-2 border-t border-line bg-card px-5 pb-1 pt-3">
          <button type="button" className="btn btn-outline flex-1" onClick={() => setF({ ...EMPTY_FILTERS, sort: f.sort })}>Clear</button>
          <button type="button" className="btn btn-red flex-[2]" onClick={() => setSheetOpen(false)}>
            Show {results.length} cars
          </button>
        </div>
      </Modal>

      <CompareTray cars={cars} />
    </div>
  );
}

function FilterPanel({
  f,
  set,
  toggle,
  facets,
  cars,
}: {
  f: Filters;
  set: (p: Partial<Filters>) => void;
  toggle: (k: "make" | "body" | "fuel" | "trans" | "rto", v: string) => void;
  facets: { makes: string[]; bodies: string[]; fuels: string[]; rtos: string[]; years: number[] };
  cars: PublicCar[];
}) {
  const uid = useId();
  const count = (pred: (c: PublicCar) => boolean) => cars.filter((c) => c.status !== "sold" && pred(c)).length;
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor={`${uid}-q`} className="label">Search</label>
        <input id={`${uid}-q`} type="search" className="field" placeholder="Model, brand, colour…" value={f.q} onChange={(e) => set({ q: e.target.value })} />
      </div>

      <fieldset>
        <legend className="label">Budget</legend>
        <div className="grid grid-cols-2 gap-2">
          <Dropdown
            aria-label="Minimum price"
            value={f.minPrice != null ? String(f.minPrice) : ""}
            onChange={(v) => set({ minPrice: v ? Number(v) : null })}
            options={[{ value: "", label: "No min" }, ...PRICE_STEPS.map((p) => ({ value: String(p), label: formatLakh(p), disabled: f.maxPrice != null && p >= f.maxPrice }))]}
            placeholder="No min"
          />
          <Dropdown
            aria-label="Maximum price"
            value={f.maxPrice != null ? String(f.maxPrice) : ""}
            onChange={(v) => set({ maxPrice: v ? Number(v) : null })}
            options={[{ value: "", label: "No max" }, ...PRICE_STEPS.map((p) => ({ value: String(p), label: formatLakh(p), disabled: f.minPrice != null && p <= f.minPrice }))]}
            placeholder="No max"
          />
        </div>
      </fieldset>

      <CheckGroup legend="Body type" options={facets.bodies} selected={f.body} onToggle={(v) => toggle("body", v)} count={(v) => count((c) => c.bodyType === v)} />
      <CheckGroup legend="Gearbox" options={["Automatic", "Manual"]} selected={f.trans} onToggle={(v) => toggle("trans", v)} count={(v) => count((c) => transmissionGroup(c.transmission) === v)} />
      <CheckGroup legend="Fuel" options={facets.fuels} selected={f.fuel} onToggle={(v) => toggle("fuel", v)} count={(v) => count((c) => c.fuel === v)} />
      <CheckGroup legend="Brand" options={facets.makes} selected={f.make} onToggle={(v) => toggle("make", v)} count={(v) => count((c) => c.make === v)} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-year`} className="label">Year from</label>
          <Dropdown
            id={`${uid}-year`}
            value={f.minYear != null ? String(f.minYear) : ""}
            onChange={(v) => set({ minYear: v ? Number(v) : null })}
            options={[{ value: "", label: "Any year" }, ...facets.years.map((y) => ({ value: String(y), label: `${y} or newer` }))]}
            placeholder="Any year"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-km`} className="label">Kilometres</label>
          <Dropdown
            id={`${uid}-km`}
            value={f.maxKm != null ? String(f.maxKm) : ""}
            onChange={(v) => set({ maxKm: v ? Number(v) : null })}
            options={[{ value: "", label: "Any km" }, ...KM_STEPS.map((k) => ({ value: String(k), label: `Under ${formatKm(k)}` }))]}
            placeholder="Any km"
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Owners</legend>
        <div className="flex gap-2">
          {[
            { v: null, l: "Any" },
            { v: 1, l: "1st owner" },
            { v: 2, l: "Up to 2nd" },
          ].map((o) => (
            <label key={o.l} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red ${f.owners === o.v ? "border-ink bg-ink text-white" : "border-line-strong bg-card"}`}>
              <input type="radio" name={`${uid}-owners`} className="sr-only" checked={f.owners === o.v} onChange={() => set({ owners: o.v })} />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <CheckGroup
        legend="Registered in"
        options={facets.rtos}
        selected={f.rto}
        onToggle={(v) => toggle("rto", v)}
        count={(v) => count((c) => (c.rto ?? "").toUpperCase().startsWith(v))}
        label={(v) => `${RTO_STATE_NAMES[v] ?? v} (${v})`}
      />
    </div>
  );
}

function CheckGroup({
  legend,
  options,
  selected,
  onToggle,
  count,
  label = (v) => v,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  count: (v: string) => number;
  label?: (v: string) => string;
}) {
  if (!options.length) return null;
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <ul className="space-y-1">
        {options.map((o) => (
          <li key={o}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-[0.95rem]">
              <input type="checkbox" className="size-[18px] accent-[var(--color-red)]" checked={selected.includes(o)} onChange={() => onToggle(o)} />
              <span className="flex-1">{label(o)}</span>
              <span className="num text-xs text-muted">{count(o)}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
