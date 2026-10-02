import type { Metadata } from "next";
import { SettingsForms } from "@/components/admin/SettingsForms";
import { requirePageUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePageUser("settings.edit");
  const s = await getSettings();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Changes show on the website straight away.</p>
      <SettingsForms settings={s} />
      <section className="card mt-5 p-5">
        <h2 className="font-extrabold">Data export & backup</h2>
        <p className="mt-1 text-sm text-muted">Download everything as CSV. In production, the database is also backed up daily.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/api/admin/export/cars" className="btn btn-outline btn-sm">Cars CSV</a>
          <a href="/api/admin/export/leads" className="btn btn-outline btn-sm">Leads CSV</a>
          <a href="/api/admin/export/audit" className="btn btn-outline btn-sm">Audit log CSV</a>
        </div>
      </section>
    </div>
  );
}
