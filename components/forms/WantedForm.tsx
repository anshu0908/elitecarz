"use client";
import { useRef, useState } from "react";
import { BotGuards, ConsentField, FormError, PhoneField, TextField } from "@/components/forms/Fields";
import { Thanks } from "@/components/forms/LeadForms";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import type { BookingSettings } from "@/lib/settings-defaults";

/** Empty-state "tell us what you want" form — saved as a call-back lead with the search attached. */
export function WantedForm({ summary, booking }: { summary: string; booking: BookingSettings }) {
  const ref = useRef<HTMLFormElement>(null);
  const { state, submit, fieldError } = useLeadSubmit("wanted");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [want, setWant] = useState(summary);
  const [consent, setConsent] = useState(false);
  if (state.status === "success") return <Thanks booking={booking} />;
  return (
    <form
      ref={ref}
      noValidate
      className="relative mt-5 space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ type: "call_back", name, phone, consent, message: `Looking for: ${want}` }, ref.current);
      }}
    >
      <TextField label="What are you looking for?" value={want} onChange={(e) => setWant(e.target.value)} placeholder="e.g. Automatic SUV under ₹15 L" />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} error={fieldError("name")} autoComplete="name" />
        <PhoneField label="Mobile" required value={phone} onChange={(e) => setPhone(e.target.value)} error={fieldError("phone")} />
      </div>
      <ConsentField checked={consent} onChange={setConsent} error={fieldError("consent")} />
      <BotGuards />
      <FormError message={state.status === "error" ? state.error : undefined} />
      <button type="submit" className="btn btn-red w-full" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Alert me"}
      </button>
    </form>
  );
}
