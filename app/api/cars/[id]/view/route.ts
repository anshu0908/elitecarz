import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { publicCarWhere } from "@/lib/cars";

/** Counts a car page view, at most once per visitor per car per hour. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/cars/[id]/view">) {
  const { id } = await ctx.params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`view:${ip}:${id}`, 1, 60 * 60_000).ok) return new NextResponse(null, { status: 204 });
  await db.car.updateMany({ where: { ...publicCarWhere, id }, data: { views: { increment: 1 } } });
  return new NextResponse(null, { status: 204 });
}
