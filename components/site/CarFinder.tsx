"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { applyFilters, BUDGET_PRESETS, EMPTY_FILTERS, filtersToParams, type Filters } from "@/lib/filters";
import { track } from "@/lib/client/analytics";
import type { PublicCar } from "@/lib/types";

/** Hero car finder (BRIEF §17.2.2): budget / body type / brand / transmission → inventory with filters. */
export function CarFinder({ cars }: { cars: PublicCar[] }) {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [body, setBody] = useState("");
  const [make, setMake] = useState("");
  const [trans, setTrans] = useState("");

  const available = useMemo(() => cars.filter((c) => c.status !== "sold"), [cars]);
  const bodies = [...new Set(available.map((c) => c.bodyType).filter(Boolean))] as string[];
  const makes = [...new Set(available.map((c) => c.make))].sort();

  const filters: Filters = useMemo(() => {
    const preset = BUDGET_PRESETS.find((p) => p.label === budget);
    return {
      ...EMPTY_FILTERS,
      minPrice: preset && "min" in preset ? preset.min : null,
      maxPrice: preset && "max" in preset ? preset.max : null,
      body: body ? [body] : [],
      make: make ? [make] : [],
      trans: trans ? [trans] : [],
    };
  }, [budget, body, make, trans]);
  const count = applyFilters(available, filters).length;

  return (
    <form
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white p-2.5 text-text shadow-[var(--shadow-pop)] lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        track("filter_use", { location: "hero_finder", budget, body, make, trans });
        router.push(`/cars?${filtersToParams(filters).toString()}`);
      }}
    >
      <Select label="Budget" value={budget} onChange={setBudget} options={BUDGET_PRESETS.map((p) => p.label)} placeholder="Any budget" />
      <Select label="Body type" value={body} onChange={setBody} options={bodies} placeholder="Any type" />
      <Select label="Brand" value={make} onChange={setMake} options={makes} placeholder="Any brand" />
      <Select label="Gearbox" value={trans} onChange={setTrans} options={["Automatic", "Manual"]} placeholder="Any gearbox" />
      <button type="submit" className="btn btn-red col-span-2 h-full min-h-[52px] lg:col-span-1" disabled={count === 0}>
        <Search className="size-[18px]" aria-hidden />
        <span className="num">{count === 0 ? "No matches" : `Show ${count} car${count === 1 ? "" : "s"}`}</span>
      </button>
    </form>
  );
}

function Select({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <label className="block rounded-xl bg-paper px-3 pb-1.5 pt-2 focus-within:ring-2 focus-within:ring-red">
      <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer bg-transparent py-0.5 text-[0.95rem] font-semibold outline-none">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
