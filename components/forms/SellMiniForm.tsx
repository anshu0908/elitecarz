"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { normalizeIndianMobile } from "@/lib/format";
import { track } from "@/lib/client/analytics";

export const SELL_PREFILL_KEY = "ec_sell_prefill";

/** Home-page start of the sell flow. Prefill travels via sessionStorage, not the URL (keeps the phone number out of logs). */
export function SellMiniForm() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (phone && !normalizeIndianMobile(phone)) {
          setError("Enter a 10-digit mobile number");
          return;
        }
        try {
          sessionStorage.setItem(SELL_PREFILL_KEY, JSON.stringify({ regNumber: reg.toUpperCase(), phone }));
        } catch {
          /* ignore */
        }
        track("form_start", { form: "sell_car", location: "home" });
        router.push("/sell-your-car");
      }}
    >
      <div>
        <label htmlFor="mini-reg" className="label">Registration no.</label>
        <input id="mini-reg" className="field uppercase" placeholder="DL 3C AB 1234" autoComplete="off" value={reg} onChange={(e) => setReg(e.target.value)} />
      </div>
      <div>
        <label htmlFor="mini-phone" className="label">Mobile</label>
        <input
          id="mini-phone"
          className="field"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98xxxxxxxx"
          value={phone}
          aria-invalid={!!error}
          aria-describedby={error ? "mini-phone-err" : undefined}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
        />
        {error && <p id="mini-phone-err" className="error-text">{error}</p>}
      </div>
      <button type="submit" className="btn btn-red self-end">
        Get a price <ArrowRight className="size-[18px]" aria-hidden />
      </button>
    </form>
  );
}
