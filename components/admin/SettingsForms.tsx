"use client";
import { useState, useTransition } from "react";
import { saveSettingsAction, type SettingsSection } from "@/app/admin/(panel)/settings/actions";
import { toast } from "@/components/admin/Toast";
import type { SettingsMap } from "@/lib/settings-defaults";

type FieldDef = { key: string; label: string; type?: "text" | "number" | "checkbox" | "list"; hint?: string };

const SECTIONS: { id: SettingsSection; title: string; intro?: string; fields: FieldDef[] }[] = [
  {
    id: "business",
    title: "Business profile",
    fields: [
      { key: "name", label: "Display name" },
      { key: "legalName", label: "Legal name" },
      { key: "phone", label: "Phone (10-digit)" },
      { key: "whatsapp", label: "WhatsApp number", hint: "Used for every WhatsApp button on the site" },
      { key: "email", label: "Email" },
      { key: "gstin", label: "GSTIN", hint: "Shown in the footer" },
      { key: "mapsUrl", label: "Google Maps link" },
      { key: "googleProfileUrl", label: "Google reviews link" },
      { key: "googleRating", label: "Google rating", type: "number" },
      { key: "googleReviewCount", label: "Google review count", type: "number" },
      { key: "holidayNote", label: "Holiday note" },
    ],
  },
  {
    id: "finance",
    title: "EMI defaults",
    intro: "Every EMI on the site uses these. Set them to what your lenders actually offer.",
    fields: [
      { key: "annualRatePct", label: "Interest rate (% p.a.)", type: "number" },
      { key: "tenureMonths", label: "Tenure (months)", type: "number" },
      { key: "downPaymentPct", label: "Default down payment (%)", type: "number" },
      { key: "maxLoanPct", label: "Max loan (% of price)", type: "number" },
      { key: "rateIsDemo", label: "Show the DEMO tag next to the rate", type: "checkbox" },
    ],
  },
  {
    id: "booking",
    title: "Bookings & reservations",
    fields: [
      { key: "tokenAmountInr", label: "Refundable token (₹)", type: "number" },
      { key: "refundDays", label: "Hold / refund window (days)", type: "number" },
      { key: "testDriveSlotMinutes", label: "Test drive length (minutes)", type: "number" },
      { key: "openHour", label: "Opens (hour, 24h)", type: "number" },
      { key: "closeHour", label: "Closes (hour, 24h)", type: "number" },
      { key: "holidays", label: "Closed on (YYYY-MM-DD, comma separated)", type: "list" },
      { key: "tokenIsDemo", label: "Show the DEMO tag on the token amount", type: "checkbox" },
    ],
  },
  { id: "notifications", title: "Lead notifications", fields: [{ key: "leadEmails", label: "Email new leads to (comma separated)", type: "list" }] },
  {
    id: "tracking",
    title: "Analytics",
    intro: "Only loaded for visitors who accept analytics cookies.",
    fields: [
      { key: "ga4Id", label: "GA4 measurement ID" },
      { key: "clarityId", label: "Microsoft Clarity ID" },
      { key: "metaPixelId", label: "Meta Pixel ID" },
    ],
  },
];

export function SettingsForms({ settings }: { settings: SettingsMap }) {
  return (
    <div className="space-y-5">
      {SECTIONS.map((s) => (
        <SectionForm key={s.id} section={s} initial={settings[s.id] as unknown as Record<string, unknown>} />
      ))}
    </div>
  );
}

function SectionForm({ section, initial }: { section: (typeof SECTIONS)[number]; initial: Record<string, unknown> }) {
  const [v, setV] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(section.fields.map((f) => [f.key, f.type === "list" ? ((initial[f.key] as string[]) ?? []).join(", ") : initial[f.key]])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const payload = Object.fromEntries(
          section.fields.map((f) => [f.key, f.type === "list" ? String(v[f.key] ?? "").split(",").map((x) => x.trim()).filter(Boolean) : v[f.key]]),
        );
        start(async () => {
          const res = await saveSettingsAction(section.id, payload);
          setErrors(res.ok ? {} : res.fields ?? {});
          toast(res.ok ? `${section.title} saved` : res.error, { tone: res.ok ? "ok" : "error" });
        });
      }}
    >
      <h2 className="font-extrabold">{section.title}</h2>
      {section.intro && <p className="mt-0.5 text-sm text-muted">{section.intro}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {section.fields.map((f) =>
          f.type === "checkbox" ? (
            <label key={f.key} className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" className="size-4 accent-[var(--color-red)]" checked={!!v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.checked })} /> {f.label}
            </label>
          ) : (
            <label key={f.key} className={`block ${f.type === "list" ? "sm:col-span-2" : ""}`}>
              <span className="label">{f.label}</span>
              <input className="field" inputMode={f.type === "number" ? "decimal" : undefined} value={String(v[f.key] ?? "")} aria-invalid={!!errors[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
              {errors[f.key] ? <span className="error-text block">{errors[f.key]}</span> : f.hint && <span className="hint block">{f.hint}</span>}
            </label>
          ),
        )}
      </div>
      <button type="submit" className="btn btn-dark btn-sm mt-4" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
