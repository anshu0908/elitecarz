"use client";
import { useState } from "react";
import { CarLeadModal, type LeadKind } from "@/components/forms/LeadForms";
import type { BookingSettings } from "@/lib/settings-defaults";

export function LeadButton({ kind, booking, label, className = "btn btn-red" }: { kind: LeadKind; booking: BookingSettings; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <CarLeadModal kind={open ? kind : null} onClose={() => setOpen(false)} booking={booking} />
    </>
  );
}

export function FinanceLeadButton({ booking }: { booking: BookingSettings }) {
  return <LeadButton kind="finance" booking={booking} label="Check eligibility" className="btn btn-red mt-5 w-full" />;
}
