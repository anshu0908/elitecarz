// SQLite stores array/JSON columns as strings; these keep parsing forgiving.
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function parseObject<T extends object = Record<string, unknown>>(value: string | null | undefined): T {
  if (!value) return {} as T;
  try {
    const v = JSON.parse(value);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
