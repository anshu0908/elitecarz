"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, ExternalLink, Eye, MinusCircle, Save, Send, XCircle } from "lucide-react";
import { saveCarAction } from "@/app/admin/(panel)/cars/actions";
import { ImageManager, type FormImage } from "@/components/admin/ImageManager";
import { TagInput } from "@/components/admin/TagInput";
import { toast } from "@/components/admin/Toast";
import { BADGES, BODY_TYPES, CAR_STATUSES, FUELS, REG_STATES, TRANSMISSIONS, type CarStatus } from "@/lib/constants";
import { INSPECTION_TEMPLATE, summariseInspection, type InspectionResult } from "@/lib/inspection";
import { formatInr, formatLakh } from "@/lib/format";
import { priceBreakup } from "@/lib/price";
import { carTitle } from "@/lib/slug";
import type { CarFormInput } from "@/lib/validation";
import { EMPTY_CAR, type CarFormValues, type MasterData } from "@/lib/admin/car-form-types";

export type { CarFormValues, MasterData };

const FEATURE_PRESETS = ["Sunroof", "Panoramic sunroof", "ADAS", "360° camera", "Ventilated seats", "Wireless Android Auto / Apple CarPlay", "Cruise control", "6 airbags", "Alloy wheels", "Push-button start", "Connected car tech", "Rear AC vents"];
const DRAFT_KEY = "ec_admin_new_car_draft";

type Perms = { publish: boolean; viewCost: boolean };

export function CarForm({ carId, initial, master, perms, quick = false, preview }: { carId: string | null; initial: CarFormValues; master: MasterData; perms: Perms; quick?: boolean; preview?: { slug: string; status: string } }) {
  const router = useRouter();
  const [v, setV] = useState<CarFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const restoredRef = useRef(false);

  // Autosave new-car drafts locally so a dropped connection on the lot doesn't lose work.
  useEffect(() => {
    if (carId || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CarFormValues;
        if (saved.make || saved.images.length) {
          toast("Restored your unsaved car", { action: { label: "Discard", onClick: () => { localStorage.removeItem(DRAFT_KEY); setV(initial); } } });
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
          setV({ ...EMPTY_CAR, ...saved });
        }
      }
    } catch {
      /* ignore */
    }
  }, [carId, initial]);
  useEffect(() => {
    if (carId || !dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(v));
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [v, carId, dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof CarFormValues>(k: K, val: CarFormValues[K]) => {
    setV((cur) => ({ ...cur, [k]: val }));
    setDirty(true);
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: "" }));
  };
  const bind = (k: keyof CarFormValues) => ({
    value: v[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
    "aria-invalid": !!errors[k],
  });

  const makes = Object.keys(master).sort();
  const models = Object.keys(master[v.make]?.bodyTypes ?? {}).sort();
  const variants = master[v.make]?.variants[v.model] ?? [];
  const autoTitle = carTitle({ year: Number(v.registrationYear || v.year) || 0, make: v.make, model: v.model, variant: v.variant });
  const price = Number(v.priceInr.replace(/\D/g, "")) || 0;
  const breakup = priceBreakup(price, v.tcsApplicable);
  const margin = price && v.purchasePriceInr ? price - Number(v.purchasePriceInr) - (Number(v.refurbCostInr) || 0) : null;
  const insp = useMemo(() => (v.inspection ? summariseInspection(v.inspection.items) : null), [v.inspection]);

  function toInput(status: CarStatus): CarFormInput {
    const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(/[^\d.]/g, "")));
    return {
      make: v.make, model: v.model, variant: v.variant || undefined, title: v.title || undefined, slug: v.slug || undefined,
      year: Number(v.year), registrationYear: num(v.registrationYear), fuel: v.fuel as CarFormInput["fuel"], transmission: v.transmission,
      bodyType: v.bodyType || undefined, color: v.color || undefined, seats: num(v.seats), kmDriven: num(v.kmDriven), owners: num(v.owners),
      rto: v.rto || undefined, regNumber: v.regNumber || undefined, insuranceType: v.insuranceType || undefined, insuranceValidTill: v.insuranceValidTill || undefined,
      priceInr: price, tcsApplicable: v.tcsApplicable, badge: v.badge || undefined, featured: v.featured,
      purchasePriceInr: num(v.purchasePriceInr), refurbCostInr: num(v.refurbCostInr),
      warrantyIncluded: v.warrantyIncluded, warrantyMonths: num(v.warrantyMonths), warrantyKm: num(v.warrantyKm), warrantyNote: v.warrantyNote || undefined,
      engineCc: num(v.engineCc), powerBhp: num(v.powerBhp), mileageKmpl: num(v.mileageKmpl),
      description: v.description || undefined, highlights: v.highlights, features: v.features, disclosures: v.disclosures,
      videoUrl: v.videoUrl || undefined, notesInternal: v.notesInternal || undefined, status,
      images: v.images.map((i) => ({ url: i.url, alt: i.alt ?? null, category: i.category ?? null })), heroIndex: v.heroIndex,
      inspection: v.inspection
        ? { inspectedBy: v.inspection.inspectedBy || undefined, inspectedOn: v.inspection.inspectedOn || undefined, summary: v.inspection.summary || undefined, items: v.inspection.items }
        : quick ? undefined : null,
    };
  }

  function save(status: CarStatus) {
    setFormError(null);
    startTransition(async () => {
      const res = await saveCarAction(carId, toInput(status));
      if (!res.ok) {
        setErrors(res.fields ?? {});
        setFormError(res.error);
        toast(res.error, { tone: "error" });
        return;
      }
      setDirty(false);
      if (!carId) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
      }
      setV((cur) => ({ ...cur, status: res.status as CarStatus, slug: res.slug }));
      toast(
        res.status === "published" ? "Published — it's live on the website now" : res.status === "draft" ? "Saved as draft" : `Saved (${res.status})`,
        res.status === "published" ? { action: { label: "View", onClick: () => { window.open(`/cars/${res.slug}`, "_blank"); } } } : {},
      );
      if (!carId) router.replace(`/admin/cars/${res.id}`);
      else router.refresh();
    });
  }

  const sections = quick
    ? []
    : [
        ["basics", "Basics"], ["usage", "Usage & registration"], ["pricing", "Pricing"], ["warranty", "Warranty"], ["photos", "Photos"],
        ["details", "Highlights & features"], ["inspection", "Inspection"], ["seo", "Listing & SEO"],
      ];

  const err = (k: string) => errors[k] ? <p className="error-text">{errors[k]}</p> : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        // Enter never publishes by accident: it saves with the current status.
        save(carId ? v.status : "draft");
      }}
      className="pb-24"
    >
      {sections.length > 0 && (
        <nav aria-label="Form sections" className="sticky top-14 z-10 -mx-4 mb-5 overflow-x-auto border-b border-line bg-paper/95 px-4 py-2 backdrop-blur lg:top-0 md:mx-0 md:px-0">
          <ul className="flex gap-1">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted hover:bg-card hover:text-text">{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {formError && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-soft px-3 py-2.5 text-sm text-bad">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {formError}
        </p>
      )}

      <div className="space-y-5">
        <Section id="basics" title={quick ? "Quick add — the essentials" : "Basics"} intro={quick ? "Saves as a draft. Finish the rest later from the full form." : undefined}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="f-make">Make *</label>
              <input id="f-make" list="dl-makes" className="field" {...bind("make")} autoComplete="off" />
              <datalist id="dl-makes">{makes.map((m) => <option key={m} value={m} />)}</datalist>
              {err("make")}
            </div>
            <div>
              <label className="label" htmlFor="f-model">Model *</label>
              <input
                id="f-model"
                list="dl-models"
                className="field"
                {...bind("model")}
                onChange={(e) => {
                  set("model", e.target.value);
                  const bt = master[v.make]?.bodyTypes[e.target.value];
                  if (bt) set("bodyType", bt);
                }}
                autoComplete="off"
              />
              <datalist id="dl-models">{models.map((m) => <option key={m} value={m} />)}</datalist>
              {err("model")}
              {v.make && v.model && !models.includes(v.model) && <p className="hint">New model — it&apos;ll be added to the list.</p>}
            </div>
            <div>
              <label className="label" htmlFor="f-variant">Variant</label>
              <input id="f-variant" list="dl-variants" className="field" {...bind("variant")} autoComplete="off" placeholder="e.g. Sharp Pro CVT" />
              <datalist id="dl-variants">{variants.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <Field label="Manufacturing year *" error={errors.year}><input className="field" inputMode="numeric" {...bind("year")} /></Field>
            {!quick && <Field label="Registration year"><input className="field" inputMode="numeric" {...bind("registrationYear")} placeholder={v.year} /></Field>}
            <Field label="Fuel"><select className="field" {...bind("fuel")}>{FUELS.map((f) => <option key={f}>{f}</option>)}</select></Field>
            <Field label="Gearbox"><select className="field" {...bind("transmission")}>{TRANSMISSIONS.map((f) => <option key={f}>{f}</option>)}</select></Field>
            {!quick && (
              <>
                <Field label="Body type"><select className="field" {...bind("bodyType")}>{BODY_TYPES.map((f) => <option key={f}>{f}</option>)}</select></Field>
                <Field label="Colour"><input className="field" {...bind("color")} /></Field>
                <Field label="Seats"><input className="field" inputMode="numeric" {...bind("seats")} /></Field>
              </>
            )}
            {quick && (
              <>
                <Field label="Kilometres"><input className="field" inputMode="numeric" {...bind("kmDriven")} placeholder="49000" /></Field>
                <Field label="Owners"><select className="field" {...bind("owners")}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></Field>
                <Field label="Price (₹) *" error={errors.priceInr} hint={price ? formatInr(price) : undefined}><input className="field" inputMode="numeric" {...bind("priceInr")} placeholder="1475000" /></Field>
              </>
            )}
          </div>
        </Section>

        {!quick && (
          <Section id="usage" title="Usage & registration">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Kilometres driven"><input className="field" inputMode="numeric" {...bind("kmDriven")} /></Field>
              <Field label="Owners"><select className="field" {...bind("owners")}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></Field>
              <Field label="RTO / state" hint="e.g. DL, HR03"><input className="field uppercase" list="dl-rto" {...bind("rto")} /><datalist id="dl-rto">{REG_STATES.map((s) => <option key={s.code} value={s.code} />)}</datalist></Field>
              <Field label="Registration number" hint="Full number is admin-only; the site shows it masked."><input className="field uppercase" {...bind("regNumber")} placeholder="DL3CAB1234" /></Field>
              <Field label="Insurance type"><input className="field" list="dl-ins" {...bind("insuranceType")} /><datalist id="dl-ins"><option value="Zero depreciation" /><option value="Comprehensive" /><option value="Third party" /><option value="Expired" /></datalist></Field>
              <Field label="Insurance valid till"><input type="date" className="field" {...bind("insuranceValidTill")} /></Field>
            </div>
          </Section>
        )}

        {!quick && (
          <Section id="pricing" title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Price (₹) *" error={errors.priceInr}><input className="field" inputMode="numeric" {...bind("priceInr")} placeholder="1475000" /></Field>
              <Field label="Badge"><select className="field" {...bind("badge")}><option value="">None</option>{BADGES.map((b) => <option key={b}>{b}</option>)}</select></Field>
              <div className="flex flex-col justify-end gap-2 pb-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-[var(--color-red)]" checked={v.tcsApplicable} onChange={(e) => set("tcsApplicable", e.target.checked)} /> TCS applies (above ₹10 L)</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-[var(--color-red)]" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} disabled={!perms.publish} /> Featured on home page</label>
              </div>
            </div>
            {price > 0 && (
              <p className="num mt-3 rounded-lg bg-paper px-3 py-2 text-sm">
                Buyer sees: <strong>{formatInr(price)}</strong> + TCS {formatInr(breakup.tcs)} = <strong>{formatInr(breakup.total)}</strong> total
              </p>
            )}
            {perms.viewCost && (
              <div className="mt-4 rounded-xl border border-dashed border-line-strong p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Internal only — never shown on the website or to Sales</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Purchase price (₹)"><input className="field" inputMode="numeric" {...bind("purchasePriceInr")} /></Field>
                  <Field label="Refurb cost (₹)"><input className="field" inputMode="numeric" {...bind("refurbCostInr")} /></Field>
                  <div>
                    <p className="label">Expected margin</p>
                    <p className={`num font-display text-2xl font-bold ${margin != null && margin < 0 ? "text-bad" : ""}`}>{margin != null ? formatLakh(margin) : "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        {!quick && (
          <Section id="warranty" title="Warranty">
            <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--color-red)]" checked={v.warrantyIncluded} onChange={(e) => set("warrantyIncluded", e.target.checked)} /> Warranty included</label>
            {v.warrantyIncluded && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Months"><input className="field" inputMode="numeric" {...bind("warrantyMonths")} /></Field>
                <Field label="Km limit"><input className="field" inputMode="numeric" {...bind("warrantyKm")} /></Field>
                <Field label="Provider / notes"><input className="field" {...bind("warrantyNote")} /></Field>
              </div>
            )}
          </Section>
        )}

        <Section id="photos" title={`Photos (${v.images.length})`}>
          <ImageManager images={v.images} heroIndex={v.heroIndex} error={errors.images} onChange={(images, heroIndex) => { setV((cur) => ({ ...cur, images, heroIndex })); setDirty(true); }} />
          {!quick && (
            <div className="mt-4 max-w-lg">
              <Field label="Walkaround video URL" hint="YouTube or Google Drive link" error={errors.videoUrl}><input className="field" {...bind("videoUrl")} /></Field>
            </div>
          )}
        </Section>

        {!quick && (
          <Section id="details" title="Highlights, features & disclosures">
            <div className="grid gap-6 lg:grid-cols-2">
              <TagInput label="Highlights" value={v.highlights} onChange={(x) => set("highlights", x)} placeholder="e.g. Single owner, Delhi registered" />
              <TagInput label="Features" value={v.features} onChange={(x) => set("features", x)} presets={FEATURE_PRESETS} />
              <TagInput label="Known issues (shown to buyers)" value={v.disclosures} onChange={(x) => set("disclosures", x)} placeholder="e.g. Scuff on rear bumper" hint="Honest disclosures build trust — list anything a buyer would notice." />
              <div>
                <label className="label" htmlFor="f-desc">Description</label>
                <textarea id="f-desc" className="field min-h-[130px]" {...bind("description")} placeholder="Plain words: who owned it, how it's been used, what's special." />
              </div>
              <div className="lg:col-span-2">
                <label className="label" htmlFor="f-notes">Internal notes</label>
                <textarea id="f-notes" className="field min-h-[80px]" {...bind("notesInternal")} placeholder="Staff only" />
              </div>
            </div>
          </Section>
        )}

        {!quick && (
          <Section id="inspection" title="Inspection report">
            {!v.inspection ? (
              <div className="text-center">
                <p className="text-sm text-muted">No report yet. Start from the checklist — everything defaults to Pass, change what isn&apos;t.</p>
                <button
                  type="button"
                  className="btn btn-dark mt-3"
                  onClick={() =>
                    set("inspection", {
                      inspectedBy: "",
                      inspectedOn: new Date().toISOString().slice(0, 10),
                      summary: "",
                      items: INSPECTION_TEMPLATE.flatMap((s) => s.items.map((item) => ({ section: s.section, item, result: "pass" as InspectionResult, note: "" }))),
                    })
                  }
                >
                  <ClipboardList className="size-4" aria-hidden /> Start inspection report
                </button>
              </div>
            ) : (
              <InspectionBuilder value={v.inspection} onChange={(x) => set("inspection", x)} score={insp?.score ?? 0} />
            )}
          </Section>
        )}

        {!quick && (
          <Section id="seo" title="Listing & SEO">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" hint={`Leave blank for: ${autoTitle || "—"}`}><input className="field" {...bind("title")} placeholder={autoTitle} /></Field>
              <Field label="URL slug" hint="Changing it on a live car keeps the old link working (301)."><input className="field" {...bind("slug")} /></Field>
            </div>
            <div className="mt-4 rounded-xl border border-line bg-paper p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Google preview</p>
              <p className="mt-1 truncate text-[1.05rem] text-[#1a0dab]">{(v.title || autoTitle) || "Car title"} — {price ? formatLakh(price) : "₹—"} | EliteCarz Delhi</p>
              <p className="truncate text-xs text-ok">elitecarz.in/cars/{v.slug || "…"}</p>
              <p className="line-clamp-2 text-muted">{(v.title || autoTitle)} for {price ? formatLakh(price) : "—"} (fixed price, RC transfer included). {v.kmDriven && `${Number(v.kmDriven).toLocaleString("en-IN")} km · `}{v.fuel} · {v.transmission}…</p>
            </div>
          </Section>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:left-[232px]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2">
          <span className="mr-auto flex items-center gap-2 text-sm text-muted">
            Status:
            <select aria-label="Status" className="rounded-md border border-line bg-card px-2 py-1 text-sm font-semibold capitalize text-text" value={v.status} disabled={!perms.publish} onChange={(e) => set("status", e.target.value as CarStatus)}>
              {CAR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {dirty && <span className="hidden sm:inline">· unsaved changes</span>}
          </span>
          {preview && (
            <a href={preview.status === "published" || preview.status === "reserved" || preview.status === "sold" ? `/cars/${preview.slug}` : `/admin/cars/${carId}/preview`} target="_blank" className="btn btn-outline btn-sm">
              {preview.status === "draft" || preview.status === "archived" ? <Eye className="size-4" aria-hidden /> : <ExternalLink className="size-4" aria-hidden />}
              {preview.status === "draft" || preview.status === "archived" ? "Preview" : "View live"}
            </a>
          )}
          <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={() => save(carId ? v.status : "draft")}>
            <Save className="size-4" aria-hidden /> {carId ? "Save" : "Save draft"}
          </button>
          {perms.publish && v.status !== "published" && !quick && (
            <button type="button" className="btn btn-red btn-sm" disabled={pending} onClick={() => save("published")}>
              <Send className="size-4" aria-hidden /> Publish
            </button>
          )}
          {quick && <Link href="/admin/cars/new" className="btn btn-outline btn-sm">Full form</Link>}
        </div>
      </div>
    </form>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-28 p-5 md:p-6" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="text-lg font-extrabold" style={{ fontStretch: "100%" }}>{title}</h2>
      {intro && <p className="mt-0.5 text-sm text-muted">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="error-text block">{error}</span> : hint ? <span className="hint block">{hint}</span> : null}
    </label>
  );
}

const RESULT_BTNS: { r: InspectionResult; icon: typeof CheckCircle2; cls: string; label: string }[] = [
  { r: "pass", icon: CheckCircle2, cls: "text-ok", label: "Pass" },
  { r: "minor", icon: AlertTriangle, cls: "text-warn", label: "Minor" },
  { r: "fail", icon: XCircle, cls: "text-bad", label: "Fail" },
  { r: "na", icon: MinusCircle, cls: "text-muted", label: "N/A" },
];

function InspectionBuilder({ value, onChange, score }: { value: NonNullable<CarFormValues["inspection"]>; onChange: (v: CarFormValues["inspection"]) => void; score: number }) {
  const sections = [...new Set(value.items.map((i) => i.section))];
  const update = (idx: number, patch: Partial<(typeof value.items)[number]>) => onChange({ ...value, items: value.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block"><span className="label">Inspected by</span><input className="field" value={value.inspectedBy} onChange={(e) => onChange({ ...value, inspectedBy: e.target.value })} /></label>
        <label className="block"><span className="label">Date</span><input type="date" className="field" value={value.inspectedOn} onChange={(e) => onChange({ ...value, inspectedOn: e.target.value })} /></label>
        <div className="rounded-xl bg-ink px-4 py-2 text-white">
          <p className="text-xs text-white/60">Auto score</p>
          <p className="num font-display text-2xl font-bold">{score}/10</p>
        </div>
      </div>
      <label className="mt-3 block"><span className="label">Summary for buyers</span><textarea className="field min-h-[70px]" value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></label>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line">
        {sections.map((sec) => {
          const rows = value.items.map((it, idx) => ({ it, idx })).filter((x) => x.it.section === sec);
          const issues = rows.filter((x) => x.it.result === "minor" || x.it.result === "fail").length;
          return (
            <details key={sec} className="group px-3" open={issues > 0}>
              <summary className="flex cursor-pointer list-none items-center gap-2 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{sec}</span>
                {issues > 0 && <span className="chip bg-warn-soft text-warn">{issues} to note</span>}
                <span className="num text-xs text-muted">{rows.length} items</span>
              </summary>
              <ul className="space-y-2 pb-3">
                {rows.map(({ it, idx }) => (
                  <li key={it.item} className="grid gap-2 rounded-lg bg-paper p-2 sm:grid-cols-[1fr_auto]">
                    <span className="text-sm">{it.item}</span>
                    <div role="radiogroup" aria-label={`${it.item} result`} className="flex gap-1">
                      {RESULT_BTNS.map(({ r, icon: Icon, cls, label }) => (
                        <button key={r} type="button" role="radio" aria-checked={it.result === r} onClick={() => update(idx, { result: r })} className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${it.result === r ? "border-ink bg-card" : "border-transparent text-muted hover:bg-card"}`}>
                          <Icon className={`size-3.5 ${cls}`} aria-hidden /> {label}
                        </button>
                      ))}
                    </div>
                    {(it.result === "minor" || it.result === "fail" || it.note) && (
                      <input aria-label={`Note for ${it.item}`} className="rounded-md border border-line px-2 py-1 text-sm sm:col-span-2" placeholder="Note shown to buyers" value={it.note} onChange={(e) => update(idx, { note: e.target.value })} />
                    )}
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
      <button type="button" className="mt-3 text-sm font-semibold text-bad hover:underline" onClick={() => onChange(null)}>Remove report</button>
    </div>
  );
}
