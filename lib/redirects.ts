import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Old Shopify URLs (/products/*, /collections/*, /pages/*) → new routes via the redirects table (BRIEF §20). */
export async function legacyRedirect(req: Request, path: string) {
  const r = await db.redirect.findUnique({ where: { fromPath: path } });
  const to = r?.toPath ?? (path.startsWith("/products/") || path.startsWith("/collections/") ? "/cars" : "/");
  return NextResponse.redirect(new URL(to, req.url), r?.code === 302 ? 302 : 301);
}
