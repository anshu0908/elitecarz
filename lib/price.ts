// Price breakup: car price + TCS = total payable. RC transfer is included in the car price.
// TCS at 1% applies to cars priced above ₹10 lakh (Income Tax Act s.206C(1F)) — confirm with the owner's CA.

export const TCS_THRESHOLD_INR = 10_00_000;
export const TCS_RATE_PCT = 1;

export type PriceBreakup = { carPrice: number; tcs: number; total: number; tcsApplies: boolean };

export function priceBreakup(priceInr: number, tcsApplicable = true): PriceBreakup {
  const tcsApplies = tcsApplicable && priceInr > TCS_THRESHOLD_INR;
  const tcs = tcsApplies ? Math.round((priceInr * TCS_RATE_PCT) / 100) : 0;
  return { carPrice: priceInr, tcs, total: priceInr + tcs, tcsApplies };
}
