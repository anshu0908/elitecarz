/**
 * Sanitizes and validates a database connection URL for the libSQL Prisma adapter.
 *
 * LibSQL strictly validates URL query parameters and only permits 'tls' and 'authToken'
 * in remote mode, and 'cache' in memory mode.
 * Passing query parameters like 'sslmode' (common in Postgres connection strings or copied URLs)
 * causes LibSQL to throw URL_PARAM_NOT_SUPPORTED ('Unsupported URL query parameter "sslmode"').
 */
export function sanitizeLibsqlUrl(rawUrl?: string | null): { url: string; authToken?: string } {
  if (!rawUrl || !rawUrl.trim()) {
    return { url: "file:./prisma/dev.db" };
  }

  const trimmed = rawUrl.trim();

  // Handle local SQLite file URLs
  if (trimmed.startsWith("file:")) {
    const [pathOnly] = trimmed.split("?");
    return { url: pathOnly || "file:./prisma/dev.db" };
  }

  // Handle accidental PostgreSQL URLs passed to the libSQL adapter
  if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
    console.warn(
      `[DATABASE_URL Warning] Detected PostgreSQL URL protocol, but EliteCarz is configured for Prisma with libSQL/SQLite (Turso). ` +
      `Falling back to local SQLite ("file:./prisma/dev.db") to prevent build failure. For production, connect a Turso database (libsql://...).`
    );
    return { url: "file:./prisma/dev.db" };
  }

  try {
    const parsed = new URL(trimmed);
    const authToken = parsed.searchParams.get("authToken") || undefined;
    const tls = parsed.searchParams.get("tls");
    const cache = parsed.searchParams.get("cache");

    // Rebuild query parameters strictly allowing only valid libSQL parameters
    const cleanParams = new URLSearchParams();
    if (tls !== null) cleanParams.set("tls", tls);
    if (authToken) cleanParams.set("authToken", authToken);
    if (cache !== null) cleanParams.set("cache", cache);

    const query = cleanParams.toString();
    parsed.search = query ? `?${query}` : "";

    return {
      url: parsed.toString(),
      authToken,
    };
  } catch {
    // If URL parsing fails, strip query string as a safe fallback
    const [baseUrl] = trimmed.split("?");
    return { url: baseUrl };
  }
}
