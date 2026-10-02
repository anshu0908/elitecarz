import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/UsersManager";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requirePageUser("users.manage");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true } });
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Who can sign in and what they can do. Sales can add draft cars and work their own leads; Viewers can only look.</p>
      <UsersManager meId={me.id} users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} />
    </div>
  );
}
