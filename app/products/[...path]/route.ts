import { legacyRedirect } from "@/lib/redirects";

export async function GET(req: Request, ctx: RouteContext<"/products/[...path]">) {
  const { path } = await ctx.params;
  return legacyRedirect(req, `/products/${path.join("/")}`);
}
