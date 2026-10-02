"use client";
import Script from "next/script";

/**
 * Cloudflare Turnstile widget. Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set
 * (placeholder for the demo; the server skips verification without a secret key).
 * The widget writes its token into a hidden "cf-turnstile-response" input inside the form.
 */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-size="flexible" />
    </>
  );
}
