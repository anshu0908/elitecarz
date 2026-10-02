import "server-only";
import { LEAD_TYPE_LABELS, type LeadType } from "@/lib/constants";
import { formatPhone } from "@/lib/format";

/**
 * Staff notification for a new lead (BRIEF §16.5). Sends via Resend when
 * RESEND_API_KEY is set; otherwise logs to the server console (demo mode).
 */
export async function notifyNewLead(lead: { id: string; type: string; name?: string | null; phone?: string | null; carTitle?: string | null; message?: string | null }, recipients: string[]) {
  const label = LEAD_TYPE_LABELS[lead.type as LeadType] ?? lead.type;
  const subject = `New ${label.toLowerCase()}${lead.carTitle ? ` — ${lead.carTitle}` : ""}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/leads/${lead.id}`;
  const text = [
    subject,
    lead.name ? `Name: ${lead.name}` : null,
    lead.phone ? `Phone: ${formatPhone(lead.phone)}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    `Open: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const key = process.env.RESEND_API_KEY;
  if (!key || !recipients.length) {
    console.info(`[notify] ${text.replace(/\n/g, " | ")}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.NOTIFY_FROM ?? "EliteCarz Leads <leads@elitecarz.in>", to: recipients, subject, text }),
    });
  } catch (e) {
    console.error("[notify] failed", e);
  }
}
