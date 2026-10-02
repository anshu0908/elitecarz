import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_ROOT } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";

/**
 * Serves uploaded images. Car photos are public; photos sent with sell-my-car
 * requests are lead data and only visible to signed-in staff (BRIEF §15.3 public/private rule).
 */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const [folder, file] = parts;
  if (parts.length !== 2 || !/^[\w-]+\.webp$/.test(file ?? "") || !["cars", "sell"].includes(folder)) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (folder === "sell" && !(await getCurrentUser())) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_ROOT, folder, file));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": folder === "cars" ? "public, max-age=31536000, immutable" : "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
