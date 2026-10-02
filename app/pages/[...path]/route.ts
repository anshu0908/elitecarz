import { legacyRedirect } from "@/lib/redirects";

export async function GET(req: Request, ctx: RouteContext<"/pages/[...path]">) {
  const { path } = await ctx.params;
  return legacyRedirect(req, `/pages/${path.join("/")}`);
}
