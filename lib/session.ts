// Signed session token (JWT, HS256). Edge-safe: used by proxy.ts and server code.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ec_session";
export const SESSION_MAX_AGE_S = 8 * 60 * 60; // 8 h absolute
export const SESSION_IDLE_S = 30 * 60; // 30 min idle — renewed on activity

export type SessionPayload = { uid: string; role: string; name: string };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ chars)");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-0000");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, issuedAt = Math.floor(Date.now() / 1000)): Promise<string> {
  return new SignJWT({ ...payload, iat0: issuedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_IDLE_S}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<(SessionPayload & { iat0: number; exp: number }) | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const p = payload as unknown as SessionPayload & { iat0: number; exp: number };
    if (!p.uid || !p.role) return null;
    if (Date.now() / 1000 - p.iat0 > SESSION_MAX_AGE_S) return null;
    return p;
  } catch {
    return null;
  }
}
