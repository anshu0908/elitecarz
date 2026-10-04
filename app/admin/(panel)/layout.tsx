import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toaster } from "@/components/admin/Toast";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · EliteCarz admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  let newLeads = 0;
  try {
    newLeads = await db.lead.count({ where: { status: "new", type: { not: "whatsapp_click" } } });
  } catch {
    newLeads = 0;
  }
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[232px_1fr]">
      <AdminNav user={user} newLeads={newLeads} />
      <div className="min-w-0">
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 md:px-7 md:pt-7">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
