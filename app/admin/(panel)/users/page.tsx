import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/UsersManager";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Users" };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | string | null;
};

const FALLBACK_USERS: UserRow[] = [
  { id: "demo-owner", name: "Owner (Demo)", email: "owner@elitecarz.demo", role: "owner", isActive: true, lastLoginAt: "2025-01-01T10:00:00.000Z" },
  { id: "demo-manager", name: "Manager (Demo)", email: "manager@elitecarz.demo", role: "manager", isActive: true, lastLoginAt: "2025-01-01T08:00:00.000Z" },
  { id: "demo-sales", name: "Sales (Demo)", email: "sales@elitecarz.demo", role: "sales", isActive: true, lastLoginAt: "2025-01-01T05:00:00.000Z" },
  { id: "demo-viewer", name: "Viewer (Demo)", email: "viewer@elitecarz.demo", role: "viewer", isActive: true, lastLoginAt: null },
];

export default async function UsersPage() {
  const me = await requirePageUser("users.manage");
  let users: UserRow[] = [];
  try {
    users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true } });
  } catch (err) {
    console.warn("UsersPage: db query failed:", err);
  }

  if (users.length === 0) {
    users = FALLBACK_USERS;
  }
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Who can sign in and what they can do. Sales can add draft cars and work their own leads; Viewers can only look.</p>
      <UsersManager meId={me.id} users={users.map((u) => ({ ...u, lastLoginAt: typeof u.lastLoginAt === "string" ? u.lastLoginAt : u.lastLoginAt?.toISOString() ?? null }))} />
    </div>
  );
}
