// The single EMI engine used everywhere (cards, car page, finance page).
// EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annualRate / 12 / 100.

export type EmiInput = { principal: number; annualRatePct: number; tenureMonths: number };
export type EmiResult = { emi: number; totalInterest: number; totalPayment: number };

export function calculateEmi({ principal, annualRatePct, tenureMonths }: EmiInput): EmiResult {
  if (principal <= 0 || tenureMonths <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
  const r = annualRatePct / 12 / 100;
  const emi = r === 0 ? principal / tenureMonths : (principal * r * (1 + r) ** tenureMonths) / ((1 + r) ** tenureMonths - 1);
  const totalPayment = emi * tenureMonths;
  return { emi, totalInterest: totalPayment - principal, totalPayment };
}

// DEMO assumptions until the owner confirms real lender rates (BRIEF §13 Q3).
export const EMI_DEFAULTS = {
  annualRatePct: 10.5,
  tenureMonths: 60,
  downPaymentPct: 20,
  maxLoanPct: 80,
  tenureOptions: [12, 24, 36, 48, 60, 72, 84],
} as const;

/** Indicative "from" EMI shown on cards: max loan, default rate and tenure. */
export function startingEmi(priceInr: number, opts = EMI_DEFAULTS): number {
  return calculateEmi({
    principal: (priceInr * opts.maxLoanPct) / 100,
    annualRatePct: opts.annualRatePct,
    tenureMonths: opts.tenureMonths,
  }).emi;
}
