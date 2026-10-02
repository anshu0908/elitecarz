"use server";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { endSession, startSession, getCurrentUser } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export type LoginState = { error?: string; email?: string };

// Constant-time-ish failure path: compare against a dummy hash when the user doesn't exist.
const DUMMY_HASH = bcrypt.hashSync("never-a-real-password", 10);

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  // 5 attempts per email per 15 minutes, 20 per IP — then locked out for the window.
  const byEmail = rateLimit(`login:${email}`, 5, 15 * 60_000);
  const byIp = rateLimit(`login-ip:${ip}`, 20, 15 * 60_000);
  if (!byEmail.ok || !byIp.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(Math.max(byEmail.retryAfterS, byIp.retryAfterS) / 60)} minutes.`, email };
  }
  if (!(await verifyTurnstile(form.get("cf-turnstile-response") as string | null, ip))) return { error: "Bot check failed. Please retry.", email };
  if (!email || !password) return { error: "Enter your email and password.", email };

  const user = await db.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.isActive) {
    await audit(user?.id ?? null, "login_failed", "user", user?.id, { email });
    return { error: user && !user.isActive ? "This account has been deactivated." : "Email or password is incorrect.", email };
  }

  resetRateLimit(`login:${email}`);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession(user);
  await audit(user.id, "login", "user", user.id);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  const user = await getCurrentUser();
  if (user) await audit(user.id, "logout", "user", user.id);
  await endSession();
  redirect("/admin/login");
}
