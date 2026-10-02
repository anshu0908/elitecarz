"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormError, PhoneField, SelectField, TextField } from "@/components/forms/Fields";
import { createManualLeadAction } from "@/app/admin/(panel)/leads/actions";
import { toast } from "@/components/admin/Toast";
import { LEAD_TYPE_LABELS, LEAD_TYPES } from "@/lib/constants";

/** Walk-in / phone lead entry. */
export function NewLeadButton({ cars }: { cars: { id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [v, setV] = useState({ type: "enquiry", name: "", phone: "", carId: "", source: "walk-in", message: "" });
  const [err, setErr] = useState<{ error?: string; fields?: Record<string, string> }>({});
  return (
    <>
      <button type="button" className="btn btn-red btn-sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden /> Add lead
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add a walk-in or phone lead">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await createManualLeadAction(v);
              if (!res.ok) return setErr({ error: res.error, fields: "fields" in res ? res.fields : undefined });
              toast("Lead added");
              setOpen(false);
              router.push(`/admin/leads/${res.id}`);
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.fields?.name} />
            <PhoneField label="Mobile" required value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={err.fields?.phone} />
            <SelectField label="Type" value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} options={LEAD_TYPES.filter((t) => t !== "whatsapp_click").map((t) => ({ value: t, label: LEAD_TYPE_LABELS[t] }))} />
            <SelectField label="Source" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} options={["walk-in", "phone", "whatsapp", "referral", "google", "instagram", "other"]} />
            <SelectField label="Car of interest" className="sm:col-span-2" value={v.carId} onChange={(e) => setV({ ...v, carId: e.target.value })} options={cars.map((c) => ({ value: c.id, label: c.title }))} placeholder="None / not sure" />
          </div>
          <div>
            <label htmlFor="ml-msg" className="label">Notes</label>
            <textarea id="ml-msg" className="field min-h-[80px]" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} />
          </div>
          <FormError message={err.error} />
          <button type="submit" className="btn btn-red w-full" disabled={pending}>{pending ? "Saving…" : "Add lead"}</button>
        </form>
      </Modal>
    </>
  );
}
