import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS, type SettingKey, type SettingsMap } from "@/lib/settings-defaults";

export const getSettings = cache(async (): Promise<SettingsMap> => {
  const out = structuredClone(DEFAULT_SETTINGS) as SettingsMap;
  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if (!(row.key in out)) continue;
      try {
        const k = row.key as SettingKey;
        out[k] = { ...out[k], ...JSON.parse(row.value) } as never;
      } catch {
        /* keep default */
      }
    }
  } catch (err) {
    console.warn("getSettings: DB query failed, using default settings:", err instanceof Error ? err.message : err);
  }
  return out;
});

/** Subset that is safe to send to the browser. */
export async function getPublicSettings() {
  const s = await getSettings();
  return { business: s.business, finance: s.finance, booking: s.booking, tracking: s.tracking };
}
export type PublicSettings = Awaited<ReturnType<typeof getPublicSettings>>;
