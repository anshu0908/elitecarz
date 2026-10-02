"use server";
import { revalidatePath } from "next/cache";
import { PermissionError, requireActionUser } from "@/lib/auth";
import { carFormSchema, fieldErrors, type CarFormInput } from "@/lib/validation";
import { ActionError, bulkCars, duplicateCar, inlineUpdate, saveCar, type BulkAction } from "@/lib/admin/cars-service";
import type { CarStatus } from "@/lib/constants";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; fields?: Record<string, string> };

function fail(e: unknown): { ok: false; error: string; fields?: Record<string, string> } {
  if (e instanceof ActionError) return { ok: false, error: e.message, fields: e.fields };
  if (e instanceof PermissionError) return { ok: false, error: e.message };
  console.error("[admin/cars]", e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

// Public pages are statically cached; refresh everything so admin changes show instantly.
function refresh() {
  revalidatePath("/", "layout");
}

export async function saveCarAction(id: string | null, input: CarFormInput): Promise<ActionResult<{ id: string; slug: string; status: string }>> {
  try {
    const user = await requireActionUser("cars.edit");
    const parsed = carFormSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
    const res = await saveCar(user, id, parsed.data);
    refresh();
    return { ok: true, ...res };
  } catch (e) {
    return fail(e);
  }
}

export async function bulkCarAction(ids: string[], action: BulkAction): Promise<ActionResult<{ count: number }>> {
  try {
    const cap = action === "purge" ? "cars.purge" : action === "delete" || action === "restore" ? "cars.delete" : "cars.publish";
    const user = await requireActionUser(cap);
    const count = await bulkCars(user, ids.slice(0, 200), action);
    refresh();
    return { ok: true, count };
  } catch (e) {
    return fail(e);
  }
}

export async function inlineUpdateAction(id: string, patch: { priceInr?: number; status?: CarStatus; featured?: boolean }): Promise<ActionResult> {
  try {
    const user = await requireActionUser("cars.edit");
    await inlineUpdate(user, id, patch);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function duplicateCarAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireActionUser("cars.edit");
    const res = await duplicateCar(user, id);
    refresh();
    return { ok: true, ...res };
  } catch (e) {
    return fail(e);
  }
}
