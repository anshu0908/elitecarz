import "server-only";

// Cloudflare Turnstile verification. If TURNSTILE_SECRET_KEY isn't set (local/demo),
// verification is skipped — rate limiting and the honeypot still apply.
export async function verifyTurnstile(token: string | null | undefined, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // If either the secret key or the public site key is missing, skip verification (fallback mode)
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch (err) {
    console.warn("verifyTurnstile: API fetch failed, permitting in fallback mode:", err instanceof Error ? err.message : err);
    return true;
  }
}
