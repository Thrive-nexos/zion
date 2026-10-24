import type { PriceBreakdown } from "@/lib/domain/types";

/** Published, demo pricing rules. Production values would live in admin-managed config. */
export const PRICING_RULES = {
  serviceFeeRate: 0.05, // paid by the guardian/learner, shown up front
  minServiceFee: 200,
  vatRate: 0.075, // Nigerian VAT, applied to the platform's service fee only
  commissionRate: 0.15, // retained from the tutor's gross
  trialMinutes: 30,
} as const;

export function priceFor(ratePerHour: number, minutes: number, isTrial: boolean, trialRate = 0): PriceBreakdown {
  const hours = minutes / 60;
  const subtotal = Math.round(ratePerHour * hours);
  const trialDiscount = isTrial ? Math.max(0, subtotal - trialRate) : 0;
  const gross = subtotal - trialDiscount;
  const platformFee = Math.max(PRICING_RULES.minServiceFee, Math.round(gross * PRICING_RULES.serviceFeeRate));
  const vat = Math.round(platformFee * PRICING_RULES.vatRate);
  const commission = Math.round(gross * PRICING_RULES.commissionRate);
  return {
    hours,
    ratePerHour,
    subtotal,
    trialDiscount,
    platformFee,
    vat,
    total: gross + platformFee + vat,
    tutorShare: gross - commission,
    commission,
  };
}
