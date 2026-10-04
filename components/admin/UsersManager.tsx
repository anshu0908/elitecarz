"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteUserAction, resetPasswordAction, updateUserAction } from "@/app/admin/(panel)/users/actions";
import { FormError, SelectField, TextField } from "@/components/forms/Fields";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/admin/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/format";

type U = { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null };

export function UsersManager({ users, meId }: { users: U[]; meId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [invite, setInvite] = useState(false);
  const [v, setV] = useState({ name: "", email: "", role: "sales" });
  const [err, setErr] = useState<{ error?: string; fields?: Record<string, string> }>({});
  const [secret, setSecret] = useState<{ email: string; pw: string } | null>(null);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? msg : r.error ?? "Failed", { tone: r.ok ? "ok" : "error" });
      router.refresh();
    });

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button type="button" className="btn btn-red btn-sm" onClick={() => setInvite(true)}>Add staff member</button>
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line bg-card" aria-busy={pending}>
        {users.map((u) => (
          <li key={u.id} className={`flex flex-wrap items-center gap-3 p-4 ${u.isActive ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{u.name} {u.id === meId && <span className="text-xs text-muted">(you)</span>}</p>
              <p className="text-sm text-muted">{u.email} · last sign-in {u.lastLoginAt ? formatDate(u.lastLoginAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "never"}</p>
            </div>
            <Dropdown
              variant="compact"
              className="w-[130px]"
              aria-label={`Role for ${u.name}`}
              value={u.role}
              disabled={u.id === meId}
              onChange={(role) => act(() => updateUserAction(u.id, { role }), "Role updated")}
              options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            />
            <button type="button" className="btn btn-outline btn-sm" disabled={u.id === meId} onClick={() => act(() => updateUserAction(u.id, { isActive: !u.isActive }), u.isActive ? "Deactivated — signed out everywhere" : "Reactivated")}>
              {u.isActive ? "Deactivate" : "Reactivate"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                start(async () => {
                  const r = await resetPasswordAction(u.id);
                  if (r.ok) setSecret({ email: u.email, pw: r.tempPassword });
                  else toast(r.error, { tone: "error" });
                })
              }
            >
              Reset password
            </button>
          </li>
        ))}
      </ul>

      <Modal open={invite} onClose={() => setInvite(false)} title="Add staff member">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await inviteUserAction(v);
              if (!r.ok) return setErr({ error: r.error, fields: "fields" in r ? r.fields : undefined });
              setInvite(false);
              setSecret({ email: v.email, pw: r.tempPassword });
              setV({ name: "", email: "", role: "sales" });
              router.refresh();
            });
          }}
        >
          <TextField label="Name" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.fields?.name} />
          <TextField label="Email" type="email" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={err.fields?.email} />
          <SelectField label="Role" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })} options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} />
          <FormError message={err.error} />
          <button type="submit" className="btn btn-red w-full" disabled={pending}>Create account</button>
        </form>
      </Modal>

      <Modal open={!!secret} onClose={() => setSecret(null)} title="One-time password">
        <p className="text-sm text-muted">Share this with {secret?.email} privately. It won&apos;t be shown again.</p>
        <p className="num mt-3 select-all rounded-lg bg-paper p-3 font-mono text-lg font-bold">{secret?.pw}</p>
        <button type="button" className="btn btn-dark mt-4 w-full" onClick={() => setSecret(null)}>Done</button>
      </Modal>
    </>
  );
}
