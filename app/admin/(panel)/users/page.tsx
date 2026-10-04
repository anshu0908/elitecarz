import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/UsersManager";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requirePageUser("users.manage");
  let users: any[] = [];
  try {
    users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true } });
  } catch (err) {
    console.warn("UsersPage: db query failed:", err);
  }

  if (users.length === 0) {
    users = [
      { id: "demo-owner", name: "Owner (Demo)", email: "owner@elitecarz.demo", role: "owner", isActive: true, lastLoginAt: new Date() },
      { id: "demo-manager", name: "Manager (Demo)", email: "manager@elitecarz.demo", role: "manager", isActive: true, lastLoginAt: new Date(Date.now() - 3600_000 * 2) },
      { id: "demo-sales", name: "Sales (Demo)", email: "sales@elitecarz.demo", role: "sales", isActive: true, lastLoginAt: new Date(Date.now() - 3600_000 * 5) },
      { id: "demo-viewer", name: "Viewer (Demo)", email: "viewer@elitecarz.demo", role: "viewer", isActive: true, lastLoginAt: null },
    ];
  }
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Who can sign in and what they can do. Sales can add draft cars and work their own leads; Viewers can only look.</p>
      <UsersManager meId={me.id} users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} />
    </div>
  );
}
