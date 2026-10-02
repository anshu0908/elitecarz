import { legacyRedirect } from "@/lib/redirects";

export async function GET(req: Request, ctx: RouteContext<"/collections/[...path]">) {
  const { path } = await ctx.params;
  return legacyRedirect(req, `/collections/${path.join("/")}`);
}
