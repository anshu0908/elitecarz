"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { BotGuards, ConsentField, FormError, PhoneField, SelectField, TextField } from "@/components/forms/Fields";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import { SELL_PREFILL_KEY } from "@/components/forms/SellMiniForm";
import { WhatsappButton } from "@/components/site/ContactButtons";
import { DemoTag } from "@/components/ui/Demo";
import { FUELS, KM_RANGES, REG_STATES, SELL_BRANDS, yearOptions } from "@/lib/constants";
import { formatInr } from "@/lib/format";
import { track } from "@/lib/client/analytics";

type Result = { id: string; valuation: { min: number; max: number; notes: string[] } | null };

const STEPS = ["Your car", "Condition", "Photos & contact"] as const;

/**
 * 3-step trade-in flow (BRIEF §9, §17.5). Fixes the old form: full brand list incl.
 * Tata/Mahindra/Toyota, years through the current year, no "less likely we buy" labels,
 * photo upload, and an instant indicative range.
 */
export function SellFlow({ modelsByMake, whatsapp }: { modelsByMake: Record<string, string[]>; whatsapp: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, submit, fieldError } = useLeadSubmit<Result>("sell_car");
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const years = yearOptions(2005);
  const [v, setV] = useState({
    regNumber: "",
    make: "",
    model: "",
    variant: "",
    mfgYear: "",
    regYear: "",
    kmRange: "",
    owners: "1",
    fuel: "",
    transmission: "",
    state: "DL",
    expectedPrice: "",
    city: "",
    name: "",
    phone: "",
    whatsapp: "",
    sameWhatsapp: true,
    consent: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Prefill from the home-page mini form (sessionStorage, not URL).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SELL_PREFILL_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { regNumber?: string; phone?: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage
        setV((cur) => ({ ...cur, regNumber: p.regNumber ?? cur.regNumber, phone: p.phone ?? cur.phone }));
        sessionStorage.removeItem(SELL_PREFILL_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setV((cur) => ({ ...cur, [k]: val }));
    setErrors((cur) => ({ ...cur, [k]: "" }));
  };

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (v.regNumber.replace(/\s/g, "").length < 4) e.regNumber = "Enter the registration number";
      if (!v.make) e.make = "Choose the brand";
      if (!v.model.trim()) e.model = "Enter the model";
      if (!v.mfgYear) e.mfgYear = "Choose the year";
      if (!v.kmRange) e.kmRange = "Choose the kilometres";
    }
    if (s === 1) {
      if (!v.fuel) e.fuel = "Choose the fuel";
      if (!v.transmission) e.transmission = "Choose the gearbox";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    track(`sell_step_${step + 1}`, { make: v.make });
    setStep((s) => s + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 8 - photos.length);
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    list.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/uploads/sell", { method: "POST", body: fd });
      const data = await res.json();
      if (data.urls?.length) {
        // Server copies are staff-only; show local previews to the seller.
        const local: Record<string, string> = {};
        data.urls.forEach((u: string, i: number) => (local[u] = URL.createObjectURL(list[i])));
        setPreviews((p) => ({ ...p, ...local }));
        setPhotos((p) => [...p, ...data.urls]);
      }
      if (data.errors?.length || data.error) setUploadError((data.errors ?? [data.error]).join(" "));
    } catch {
      setUploadError("Upload failed — check your connection, or send photos on WhatsApp later.");
    } finally {
      setUploading(false);
    }
  }

  if (state.status === "success") {
    const val = state.result.valuation;
    return (
      <div className="card p-6 text-center md:p-10" role="status">
        <CheckCircle2 className="mx-auto size-12 text-ok" aria-hidden />
        <h2 className="mt-3 text-2xl font-extrabold">Thanks, {v.name.split(" ")[0]}.</h2>
        {val && (
          <>
            <p className="mt-4 text-muted">Indicative range for your {v.mfgYear} {v.make} {v.model}</p>
            <p className="num mt-1 font-display text-[2.2rem] font-extrabold">
              {formatInr(val.min)} – {formatInr(val.max)}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              A firm offer comes after a free 30-minute inspection at our showroom or your home. <DemoTag title="Range comes from placeholder pricing logic until the dealer's own rules are added" />
            </p>
            {val.notes.length > 0 && (
              <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-sm">
                {val.notes.map((n) => (
                  <li key={n} className="rounded-lg bg-paper px-3 py-2">{n}</li>
                ))}
              </ul>
            )}
          </>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <WhatsappButton whatsapp={whatsapp} text={`Hi EliteCarz, I've just sent details of my ${v.mfgYear} ${v.make} ${v.model} (${v.regNumber.toUpperCase()}). When can you inspect it?`} location="sell_success" label="Book inspection on WhatsApp" />
          <Link href="/cars" className="btn btn-outline">Browse cars to exchange</Link>
        </div>
      </div>
    );
  }

  const models = modelsByMake[v.make] ?? [];

  return (
    <form
      ref={formRef}
      noValidate
      className="card relative scroll-mt-24 p-5 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) return next();
        submit(
          {
            type: "sell_car",
            name: v.name,
            phone: v.phone,
            whatsapp: v.sameWhatsapp ? undefined : v.whatsapp,
            consent: v.consent,
            sell: {
              regNumber: v.regNumber.replace(/\s/g, ""),
              make: v.make,
              model: v.model,
              variant: v.variant || undefined,
              mfgYear: Number(v.mfgYear),
              regYear: v.regYear ? Number(v.regYear) : undefined,
              owners: Number(v.owners),
              kmRange: v.kmRange,
              fuel: v.fuel,
              transmission: v.transmission,
              state: v.state,
              city: v.city || undefined,
              expectedPrice: v.expectedPrice ? Number(v.expectedPrice.replace(/\D/g, "")) : undefined,
              photos,
            },
          },
          formRef.current,
        );
      }}
    >
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-red" : "bg-line"}`} />
            <p className={`mt-1.5 text-xs font-semibold ${i === step ? "text-text" : "text-muted"}`}>
              <span className="num">{i + 1}.</span> {s}
            </p>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Registration number" required className="sm:col-span-2" value={v.regNumber} onChange={set("regNumber")} error={errors.regNumber || fieldError("sell.regNumber")} placeholder="DL 3C AB 1234" autoComplete="off" style={{ textTransform: "uppercase" }} />
          <SelectField label="Brand" required value={v.make} onChange={set("make")} options={SELL_BRANDS} placeholder="Choose brand" error={errors.make || fieldError("sell.make")} />
          <div>
            <TextField label="Model" required value={v.model} onChange={set("model")} list="sell-models" placeholder={models[0] ? `e.g. ${models[0]}` : "e.g. Nexon"} error={errors.model || fieldError("sell.model")} />
            <datalist id="sell-models">
              {models.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <SelectField label="Manufacturing year" required value={v.mfgYear} onChange={set("mfgYear")} options={years.map(String)} placeholder="Choose year" error={errors.mfgYear || fieldError("sell.mfgYear")} />
          <SelectField label="Kilometres driven" required value={v.kmRange} onChange={set("kmRange")} options={KM_RANGES} placeholder="Choose range" error={errors.kmRange || fieldError("sell.kmRange")} />
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Variant" value={v.variant} onChange={set("variant")} placeholder="e.g. XZ+ Diesel AT" hint="Optional" />
          <SelectField label="Registration year" value={v.regYear} onChange={set("regYear")} options={years.map(String)} placeholder="Same as manufacturing" />
          <SelectField label="Fuel" required value={v.fuel} onChange={set("fuel")} options={[...FUELS]} placeholder="Choose fuel" error={errors.fuel} />
          <SelectField label="Gearbox" required value={v.transmission} onChange={set("transmission")} options={["Manual", "Automatic", "iMT"]} placeholder="Choose gearbox" error={errors.transmission} />
          <SelectField
            label="Owners so far"
            value={v.owners}
            onChange={set("owners")}
            options={[
              { value: "1", label: "1st owner" },
              { value: "2", label: "2nd owner" },
              { value: "3", label: "3rd owner" },
              { value: "4", label: "4th or more" },
            ]}
          />
          <SelectField label="Registered in" value={v.state} onChange={set("state")} options={REG_STATES.map((s) => ({ value: s.code, label: `${s.name} (${s.code})` }))} />
          <TextField label="Price you have in mind (₹)" className="sm:col-span-2" inputMode="numeric" value={v.expectedPrice} onChange={set("expectedPrice")} hint="Optional — helps us come back with a realistic offer" />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <p className="label">Photos (optional, up to 8)</p>
            <p className="hint mb-2 mt-0">Front, back, both sides, dashboard with odometer, and any damage. Location data is removed from photos.</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((u, i) => (
                <div key={u} className="relative aspect-square overflow-hidden rounded-lg bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={previews[u]} alt={`Your photo ${i + 1}`} className="size-full object-cover" />
                  <button type="button" onClick={() => setPhotos((p) => p.filter((x) => x !== u))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/70 text-white" aria-label={`Remove photo ${i + 1}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
              {photos.length < 8 && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line-strong text-center text-xs font-semibold text-muted hover:border-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red">
                  <input type="file" accept="image/*" multiple capture="environment" className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
                  {uploading ? <Loader2 className="size-6 animate-spin" aria-label="Uploading" /> : (
                    <span className="grid place-items-center gap-1">
                      <span className="flex gap-1"><Camera className="size-5" aria-hidden /><ImagePlus className="size-5" aria-hidden /></span>
                      Add photos
                    </span>
                  )}
                </label>
              )}
            </div>
            {uploadError && <p className="error-text">{uploadError}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Your name" required value={v.name} onChange={set("name")} autoComplete="name" error={fieldError("name")} />
            <PhoneField label="Mobile number" required value={v.phone} onChange={set("phone")} error={fieldError("phone")} />
            <TextField label="City / area" value={v.city} onChange={set("city")} placeholder="e.g. Janakpuri" autoComplete="address-level2" />
            <div className="self-end">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-[var(--color-red)]" checked={v.sameWhatsapp} onChange={set("sameWhatsapp")} />
                WhatsApp on the same number
              </label>
            </div>
            {!v.sameWhatsapp && <PhoneField label="WhatsApp number" value={v.whatsapp} onChange={set("whatsapp")} error={fieldError("whatsapp")} />}
          </div>
          <ConsentField checked={v.consent} onChange={(c) => setV((cur) => ({ ...cur, consent: c }))} error={fieldError("consent")} />
          <BotGuards />
        </div>
      )}

      <div className="mt-6 space-y-3">
        <FormError message={state.status === "error" ? state.error : undefined} />
        <div className="flex gap-2">
          {step > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-[18px]" aria-hidden /> Back
            </button>
          )}
          <button type="submit" className="btn btn-red flex-1" disabled={state.status === "submitting" || uploading}>
            {step < 2 ? (
              <>
                Continue <ArrowRight className="size-[18px]" aria-hidden />
              </>
            ) : state.status === "submitting" ? (
              "Sending…"
            ) : (
              "Get my price range"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
