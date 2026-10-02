"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, IndianRupee, KeyRound, MessageSquare } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { BotGuards, ConsentField, FormError, PhoneField, SelectField, TextField } from "@/components/forms/Fields";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import { DemoTag } from "@/components/ui/Demo";
import { formatInr } from "@/lib/format";
import { track } from "@/lib/client/analytics";
import type { BookingSettings } from "@/lib/settings-defaults";

export type LeadKind = "test_drive" | "reserve" | "enquiry" | "finance" | "call_back";

const TITLES: Record<LeadKind, string> = {
  test_drive: "Book a test drive",
  reserve: "Reserve this car",
  enquiry: "Ask about this car",
  finance: "Check loan eligibility",
  call_back: "Request a call-back",
};

function istNow() {
  return new Date(Date.now() + 330 * 60_000);
}

export function isOpenNow(booking: Pick<BookingSettings, "openHour" | "closeHour">) {
  const h = istNow().getUTCHours();
  return h >= booking.openHour && h < booking.closeHour;
}

/** Thank-you copy that is honest about opening hours (after-hours capture, BRIEF §9). */
export function Thanks({ booking, children }: { booking: BookingSettings; children?: React.ReactNode }) {
  const open = isOpenNow(booking);
  return (
    <div className="py-4 text-center" role="status">
      <CheckCircle2 className="mx-auto size-12 text-ok" aria-hidden />
      <p className="mt-3 text-lg font-bold">Got it — thank you.</p>
      <p className="mt-1 text-muted">
        {open ? "Someone from the showroom will call you within the hour." : `We're closed right now. We'll call you after ${booking.openHour} am.`}
      </p>
      {children}
    </div>
  );
}

export function CarLeadModal({
  kind,
  onClose,
  car,
  booking,
}: {
  kind: LeadKind | null;
  onClose: () => void;
  car?: { id: string; title: string; priceInr: number };
  booking: BookingSettings;
}) {
  return (
    <Modal open={kind !== null} onClose={onClose} title={kind ? TITLES[kind] : ""}>
      {kind && <LeadFormBody key={kind} kind={kind} car={car} booking={booking} />}
    </Modal>
  );
}

function slotOptions(booking: BookingSettings) {
  const days: { value: string; label: string }[] = [];
  const now = istNow();
  const lastStartToday = booking.closeHour * 60 - booking.testDriveSlotMinutes;
  const earliestToday = now.getUTCHours() * 60 + now.getUTCMinutes() + 90;
  for (let i = 0; days.length < 10 && i < 20; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    const iso = d.toISOString().slice(0, 10);
    if (booking.holidays.includes(iso)) continue;
    if (i === 0 && earliestToday > lastStartToday) continue;
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d);
    days.push({ value: iso, label });
  }
  const times: { value: string; label: string }[] = [];
  for (let m = booking.openHour * 60; m + booking.testDriveSlotMinutes <= booking.closeHour * 60; m += 60) {
    const hh = Math.floor(m / 60);
    times.push({ value: `${String(hh).padStart(2, "0")}:00`, label: `${hh > 12 ? hh - 12 : hh}:00 ${hh >= 12 ? "pm" : "am"}` });
  }
  const todayIso = now.toISOString().slice(0, 10);
  const timesFor = (day: string) =>
    day === todayIso ? times.filter((t) => Number(t.value.slice(0, 2)) * 60 >= earliestToday) : times;
  return { days, timesFor };
}

function LeadFormBody({ kind, car, booking }: { kind: LeadKind; car?: { id: string; title: string; priceInr: number }; booking: BookingSettings }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, submit, fieldError } = useLeadSubmit(kind);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const { days, timesFor } = useMemo(() => slotOptions(booking), [booking]);
  const [day, setDay] = useState(days[1]?.value ?? days[0]?.value ?? "");
  const times = timesFor(day);
  const [pickedTime, setTime] = useState("12:00");
  const time = times.some((t) => t.value === pickedTime) ? pickedTime : times[0]?.value ?? "";
  const [employment, setEmployment] = useState("salaried");
  const [income, setIncome] = useState("");

  if (state.status === "success") {
    return (
      <Thanks booking={booking}>
        {kind === "reserve" && (
          <p className="mx-auto mt-4 max-w-sm rounded-lg bg-paper p-3 text-sm">
            We&apos;ll confirm availability, then send a secure payment link for the {formatInr(booking.tokenAmountInr)} refundable token. Online payment isn&apos;t switched on in this demo.
          </p>
        )}
      </Thanks>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      className="relative space-y-4"
      onFocus={() => track("form_start", { form: kind })}
      onSubmit={(e) => {
        e.preventDefault();
        const payload: Record<string, unknown> = { type: kind, name, phone, consent, carId: car?.id, message: message || undefined };
        if (kind === "test_drive") payload.slot = `${day}T${time}:00+05:30`;
        if (kind === "finance") Object.assign(payload, { employment, monthlyIncome: income ? Number(income.replace(/\D/g, "")) : undefined });
        if (kind === "reserve") track("reserve_start", { car_id: car?.id });
        submit(payload, formRef.current);
      }}
    >
      {car && (
        <p className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
          <span className="font-semibold">{car.title}</span>
          <span className="num ml-auto text-muted">{formatInr(car.priceInr)}</span>
        </p>
      )}

      {kind === "reserve" && (
        <div className="rounded-xl border border-line p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <KeyRound className="size-4 text-red" aria-hidden /> Refundable token: {formatInr(booking.tokenAmountInr)} {booking.tokenIsDemo && <DemoTag title="Token amount to be confirmed by the dealer" />}
          </p>
          <p className="mt-1.5 text-muted">
            Holds the car for you. Change your mind within {booking.refundDays} days and it&apos;s refunded in full.{" "}
            <Link href="/policies/booking-refund-policy" target="_blank" className="underline">Booking policy</Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} error={fieldError("name")} />
        <PhoneField label="Mobile number" name="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} error={fieldError("phone")} />
      </div>

      {kind === "test_drive" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Day" value={day} onChange={(e) => setDay(e.target.value)} options={days} error={fieldError("slot")} />
          <SelectField label="Time" value={time} onChange={(e) => setTime(e.target.value)} options={times} />
          <p className="hint sm:col-span-2">
            <CalendarClock className="mr-1 inline size-4" aria-hidden />
            At our Naraina showroom. Bring your driving licence.
          </p>
        </div>
      )}

      {kind === "finance" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Employment"
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            options={[
              { value: "salaried", label: "Salaried" },
              { value: "self_employed", label: "Self-employed professional" },
              { value: "business", label: "Business owner" },
            ]}
          />
          <TextField label="Monthly income (₹)" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} hint="Optional — helps us match lenders" />
        </div>
      )}

      {(kind === "enquiry" || kind === "call_back") && (
        <div>
          <label htmlFor="lead-msg" className="label">{kind === "call_back" ? "Best time to call (optional)" : "Your question (optional)"}</label>
          <textarea id="lead-msg" className="field min-h-[90px]" maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      )}

      <ConsentField checked={consent} onChange={setConsent} error={fieldError("consent")} />
      <BotGuards />
      <FormError message={state.status === "error" ? state.error : undefined} />
      <button type="submit" className="btn btn-red w-full" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : kind === "reserve" ? "Request reservation" : kind === "test_drive" ? "Book test drive" : "Send"}
      </button>
    </form>
  );
}

export const LEAD_ICONS = { test_drive: CalendarClock, reserve: KeyRound, enquiry: MessageSquare, finance: IndianRupee, call_back: MessageSquare } as const;
