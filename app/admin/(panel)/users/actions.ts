"use server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PermissionError, requireActionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { ROLES } from "@/lib/permissions";
import { fieldErrors } from "@/lib/validation";
import type { ActionResult } from "@/app/admin/(panel)/cars/actions";

// Readable 14-char temporary password (meets the 12-char minimum).
const tempPassword = () => randomBytes(12).toString("base64url").slice(0, 14);

const inviteSchema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().trim().toLowerCase().email(), role: z.enum(ROLES) });

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof PermissionError) return { ok: false, error: e.message };
  console.error(e);
  return { ok: false, error: "Something went wrong" };
}

/** Owner creates a staff account and shares the one-time password (email invite once Resend is configured). */
export async function inviteUserAction(input: unknown): Promise<ActionResult<{ tempPassword: string }> & { fields?: Record<string, string> }> {
  try {
    const owner = await requireActionUser("users.manage");
    const parsed = inviteSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
    if (await db.user.findUnique({ where: { email: parsed.data.email } })) return { ok: false, error: "That email already has an account" };
    const pw = tempPassword();
    const u = await db.user.create({ data: { ...parsed.data, passwordHash: await bcrypt.hash(pw, 10) } });
    await audit(owner.id, "invite", "user", u.id, { email: u.email, role: u.role });
    revalidatePath("/admin/users");
    return { ok: true, tempPassword: pw };
  } catch (e) {
    return fail(e);
  }
}

export async function updateUserAction(id: string, patch: { role?: string; isActive?: boolean }): Promise<ActionResult> {
  try {
    const owner = await requireActionUser("users.manage");
    if (id === owner.id) return { ok: false, error: "You can't change your own role or deactivate yourself." };
    const data: { role?: string; isActive?: boolean } = {};
    if (patch.role !== undefined) {
      if (!(ROLES as readonly string[]).includes(patch.role)) return { ok: false, error: "Unknown role" };
      data.role = patch.role;
    }
    if (patch.isActive !== undefined) data.isActive = patch.isActive;
    await db.user.update({ where: { id }, data });
    await audit(owner.id, patch.isActive === false ? "deactivate" : patch.isActive ? "activate" : "role_change", "user", id, data);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function resetPasswordAction(id: string): Promise<ActionResult<{ tempPassword: string }>> {
  try {
    const owner = await requireActionUser("users.manage");
    const pw = tempPassword();
    await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(pw, 10) } });
    await audit(owner.id, "password_reset", "user", id);
    return { ok: true, tempPassword: pw };
  } catch (e) {
    return fail(e);
  }
}
