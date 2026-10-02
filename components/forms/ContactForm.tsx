"use client";
import { useRef, useState } from "react";
import { BotGuards, ConsentField, FormError, PhoneField, TextField } from "@/components/forms/Fields";
import { Thanks } from "@/components/forms/LeadForms";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import type { BookingSettings } from "@/lib/settings-defaults";

export function ContactForm({ booking }: { booking: BookingSettings }) {
  const ref = useRef<HTMLFormElement>(null);
  const { state, submit, fieldError } = useLeadSubmit("contact");
  const [kind, setKind] = useState<"contact" | "call_back">("call_back");
  const [v, setV] = useState({ name: "", phone: "", email: "", message: "" });
  const [consent, setConsent] = useState(false);
  if (state.status === "success") return <Thanks booking={booking} />;
  return (
    <form
      ref={ref}
      noValidate
      className="relative mt-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ type: kind, ...v, consent, message: v.message || undefined }, ref.current);
      }}
    >
      <fieldset className="flex gap-2">
        <legend className="sr-only">What do you need?</legend>
        {(
          [
            ["call_back", "Call me back"],
            ["contact", "Send a message"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red ${kind === k ? "border-ink bg-ink text-white" : "border-line-strong"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" required autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={fieldError("name")} />
        <PhoneField label="Mobile" required value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={fieldError("phone")} />
      </div>
      {kind === "contact" && <TextField label="Email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={fieldError("email")} hint="Optional" />}
      <div>
        <label htmlFor="contact-msg" className="label">{kind === "call_back" ? "Best time to call (optional)" : "Message"}</label>
        <textarea id="contact-msg" className="field min-h-[110px]" maxLength={1000} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} />
      </div>
      <ConsentField checked={consent} onChange={setConsent} error={fieldError("consent")} />
      <BotGuards />
      <FormError message={state.status === "error" ? state.error : undefined} />
      <button type="submit" className="btn btn-red w-full" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : kind === "call_back" ? "Request call-back" : "Send message"}
      </button>
    </form>
  );
}
