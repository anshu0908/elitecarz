"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { calculateEmi } from "@/lib/emi";
import { formatInr, formatLakh } from "@/lib/format";
import { track } from "@/lib/client/analytics";
import { DemoTag } from "@/components/ui/Demo";
import type { FinanceSettings } from "@/lib/settings-defaults";

type Lender = { name: string; minRate: number; maxRate: number; maxTenureMonths: number };

const TENURES = [12, 24, 36, 48, 60, 72, 84];

/**
 * One EMI engine for the whole site (fixes BRIEF §6A.3). Every number shown is
 * derived from the inputs on screen, and the assumptions are printed underneath.
 */
export function EmiCalculator({
  price: initialPrice,
  finance,
  lenders = [],
  priceEditable = false,
  compact = false,
  carId,
}: {
  price: number;
  finance: FinanceSettings;
  lenders?: Lender[];
  priceEditable?: boolean;
  compact?: boolean;
  carId?: string;
}) {
  const uid = useId();
  const [price, setPrice] = useState(initialPrice);
  const [downPct, setDownPct] = useState(finance.downPaymentPct);
  const [rate, setRate] = useState(finance.annualRatePct);
  const [tenure, setTenure] = useState(finance.tenureMonths);

  const minDownPct = 100 - finance.maxLoanPct;
  const down = Math.round((price * downPct) / 100);
  const principal = price - down;
  const result = useMemo(() => calculateEmi({ principal, annualRatePct: rate, tenureMonths: tenure }), [principal, rate, tenure]);

  // Fire one analytics event per settled change, not per slider tick.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => track("emi_calculated", { car_id: carId, price, down_pct: downPct, rate, tenure }), 800);
    return () => clearTimeout(t);
  }, [price, downPct, rate, tenure, carId]);

  const interestShare = result.totalPayment ? result.totalInterest / result.totalPayment : 0;

  return (
    <div className={`grid gap-6 ${compact ? "" : "md:grid-cols-[1.1fr_1fr]"}`}>
      <div className="space-y-5">
        {priceEditable && (
          <Slider
            id={`${uid}-price`}
            label="Car price"
            value={price}
            min={2_00_000}
            max={50_00_000}
            step={25_000}
            onChange={setPrice}
            display={formatLakh(price)}
          />
        )}
        <Slider
          id={`${uid}-down`}
          label="Down payment"
          value={downPct}
          min={minDownPct}
          max={90}
          step={5}
          onChange={setDownPct}
          display={`${formatInr(down)} (${downPct}%)`}
          note={`Lenders typically finance up to ${finance.maxLoanPct}% of the price.`}
        />
        <Slider
          id={`${uid}-rate`}
          label="Interest rate (p.a.)"
          value={rate}
          min={8}
          max={18}
          step={0.25}
          onChange={setRate}
          display={`${rate.toFixed(2)}%`}
        />
        <fieldset>
          <legend className="label">Loan tenure</legend>
          <div className="flex flex-wrap gap-1.5">
            {TENURES.map((t) => (
              <label key={t} className={`num cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red ${tenure === t ? "border-ink bg-ink text-white" : "border-line-strong bg-card hover:border-ink"}`}>
                <input type="radio" name={`${uid}-tenure`} value={t} checked={tenure === t} onChange={() => setTenure(t)} className="sr-only" />
                {t / 12} yr
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col rounded-2xl bg-ink p-5 text-white dark-surface">
        <p className="text-sm text-white/70">Monthly EMI</p>
        <p className="num font-display text-[2.4rem] font-extrabold leading-tight" aria-live="polite">
          {formatInr(result.emi)}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" aria-hidden>
          <div className="h-full bg-red-on-dark" style={{ width: `${(1 - interestShare) * 100}%` }} />
        </div>
        <p className="mt-1.5 flex justify-between text-xs text-white/60">
          <span>Principal</span>
          <span>Interest</span>
        </p>
        <dl className="num mt-4 space-y-2 text-sm">
          <Row term="Loan amount" value={formatInr(principal)} />
          <Row term="Total interest" value={formatInr(result.totalInterest)} />
          <Row term="Total of EMIs" value={formatInr(result.totalPayment)} />
          <Row term="Down payment" value={formatInr(down)} />
        </dl>
        <p className="mt-auto pt-4 text-xs leading-relaxed text-white/60">
          Indicative only. Reducing-balance EMI at {rate.toFixed(2)}% p.a. over {tenure} months on {formatInr(principal)}. Processing fees and insurance not included. Your actual rate depends on the lender.{" "}
          {finance.rateIsDemo && rate === finance.annualRatePct && <DemoTag title="Default rate is a placeholder until the dealer confirms lender rates" />}
        </p>
      </div>

      {lenders.length > 0 && !compact && (
        <div className="md:col-span-2">
          <h3 className="mb-2 text-base font-bold" style={{ fontStretch: "100%" }}>Estimate by lender</h3>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="num w-full min-w-[480px] text-left text-sm">
              <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Lender</th>
                  <th className="px-3 py-2 font-semibold">Rate range</th>
                  <th className="px-3 py-2 font-semibold">EMI range ({Math.min(tenure, 84) / 12} yr)</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((l) => {
                  const t = Math.min(tenure, l.maxTenureMonths);
                  const lo = calculateEmi({ principal, annualRatePct: l.minRate, tenureMonths: t }).emi;
                  const hi = calculateEmi({ principal, annualRatePct: l.maxRate, tenureMonths: t }).emi;
                  return (
                    <tr key={l.name} className="border-t border-line">
                      <td className="px-3 py-2.5 font-semibold">{l.name}</td>
                      <td className="px-3 py-2.5">{l.minRate}% – {l.maxRate}%</td>
                      <td className="px-3 py-2.5">
                        {formatInr(lo)} – {formatInr(hi)}
                        {t !== tenure && <span className="block text-xs text-muted">max {t / 12} yr</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
      <dt className="text-white/70">{term}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  note,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  note?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label mb-0">{label}</label>
        <span className="num text-sm font-bold">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[var(--color-red)]"
        aria-valuetext={display}
      />
      {note && <p className="hint">{note}</p>}
    </div>
  );
}
