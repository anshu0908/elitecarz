"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { setConsent, useConsent } from "@/lib/client/store";

const REOPEN_EVENT = "ec:consent-open";

/** Cookie/analytics consent (BRIEF §17.10–17.11). Analytics scripts load only after "Accept all". */
export function ConsentBanner({ ga4Id }: { ga4Id: string }) {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(REOPEN_EVENT, open);
    return () => window.removeEventListener(REOPEN_EVENT, open);
  }, []);

  const show = consent === null || reopened;
  return (
    <>
      {consent === "all" && ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}
      {show && (
        <div
          role="region"
          aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-[84px] z-50 mx-auto max-w-xl rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-pop)] lg:bottom-4"
        >
          <p className="text-sm text-text">
            We use essential cookies to keep your shortlist working. With your OK we&apos;ll also use analytics to see which pages help buyers.{" "}
            <Link href="/policies/cookie-policy" className="underline">Cookie policy</Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-dark"
              onClick={() => {
                setConsent("all");
                setReopened(false);
              }}
            >
              Accept all
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => {
                setConsent("essential");
                setReopened(false);
              }}
            >
              Essential only
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ConsentReopen() {
  return (
    <button
      type="button"
      className="hover:text-white"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
    >
      Cookie settings
    </button>
  );
}
