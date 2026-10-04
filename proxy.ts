import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_IDLE_S, signSession, verifySession } from "@/lib/session";

/**
 * Optimistic admin gate + sliding idle timeout. Real authorisation happens again in
 * every admin page and server action (lib/auth.ts) — this only keeps signed-out
 * users away from admin screens and renews the 30-minute idle window on activity.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (isLogin || pathname.startsWith("/api/")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  if (isLogin) {
    // If the request has an explicit redirect query, error or logout flag, don't auto-redirect back to /admin
    if (req.nextUrl.searchParams.has("error") || req.nextUrl.searchParams.has("logout") || req.nextUrl.searchParams.has("force")) {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.next();
  const token = await signSession({ uid: session.uid, role: session.role, name: session.name }, session.iat0);
  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_IDLE_S,
  });
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
