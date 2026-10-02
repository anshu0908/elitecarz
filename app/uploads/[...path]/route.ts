import { NextResponse } from "next/server";
import { readUpload, type UploadFolder } from "@/lib/uploads";
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
  const data = await readUpload(folder as UploadFolder, file);
  if (!data) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": folder === "cars" ? "public, max-age=31536000, immutable" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
