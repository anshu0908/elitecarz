import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { leadSchema, fieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { createLead, LeadError } from "@/lib/leads";

const MAX_BODY_BYTES = 20_000;

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

/** Public lead intake (BRIEF §16.10): rate-limited, honeypot + Turnstile, Zod-validated. */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: "Request too large" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ip = clientIp(req);
  const isClick = (body as { type?: string })?.type === "whatsapp_click";
  const limit = rateLimit(`lead:${isClick ? "click" : "form"}:${ip}`, isClick ? 30 : 8, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests — please try again in a few minutes, or WhatsApp us." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterS) } });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  if (!isClick && !(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: "Bot check failed. Please refresh and try again." }, { status: 400 });
  }

  try {
    const result = await createLead(parsed.data, {});
    revalidatePath("/admin", "layout");
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (e) {
    if (e instanceof LeadError) {
      return NextResponse.json({ error: e.message, fields: e.field ? { [e.field]: e.message } : undefined }, { status: 422 });
    }
    console.error("[leads] failed", e);
    return NextResponse.json({ error: "Something went wrong. Please call or WhatsApp us." }, { status: 500 });
  }
}
