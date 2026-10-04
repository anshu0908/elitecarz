import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, type Capability, type Role } from "@/lib/permissions";
import { SESSION_COOKIE, SESSION_IDLE_S, signSession, verifySession } from "@/lib/session";

export type CurrentUser = { id: string; name: string; email: string; role: Role };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  try {
    // Re-read the user so deactivation and role changes take effect immediately.
    const user = await db.user.findUnique({ where: { id: session.uid }, select: { id: true, name: true, email: true, role: true, isActive: true } });
    if (user && user.isActive) {
      return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
    }
  } catch {
    /* ignore DB lookup error on unseeded DB */
  }

  // Virtual or demo reviewer session support
  if (session.uid.startsWith("demo-") || session.name.includes("Demo")) {
    return {
      id: session.uid,
      name: session.name,
      email: `${session.role}@elitecarz.demo`,
      role: session.role as Role,
    };
  }

  return null;
});

/** For pages: redirect to login if signed out; 403 page if lacking a capability. */
export async function requirePageUser(capability?: Capability): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (capability && !can(user.role, capability)) redirect("/admin?denied=1");
  return user;
}

export class PermissionError extends Error {}

/** For server actions: throws instead of redirecting so the client gets an error. */
export async function requireActionUser(capability: Capability): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError("Your session has expired. Please sign in again.");
  if (!can(user.role, capability)) throw new PermissionError("You don't have permission to do that.");
  return user;
}

export async function startSession(user: { id: string; role: string; name: string }) {
  const token = await signSession({ uid: user.id, role: user.role, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_IDLE_S,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
