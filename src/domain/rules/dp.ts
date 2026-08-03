import type { PolicyConfig } from "../types/operations";

// PRD 5.1: DP minimal 30% total atau senilai satu malam, mengikuti nilai terbesar.
export function dpThreshold(totalAmount: number, pricePerNight: number, policy: PolicyConfig): number {
  const byPercent = Math.round(totalAmount * policy.dpPercent);
  const oneNight = Math.round(pricePerNight);
  return policy.dpMinOneNight ? Math.max(byPercent, oneNight) : byPercent;
}

export function dpShortfall(totalAmount: number, pricePerNight: number, paidAmount: number, policy: PolicyConfig): number {
  return Math.max(0, dpThreshold(totalAmount, pricePerNight, policy) - paidAmount);
}

export function dpSatisfied(totalAmount: number, pricePerNight: number, paidAmount: number, policy: PolicyConfig): boolean {
  return dpShortfall(totalAmount, pricePerNight, paidAmount, policy) <= 0;
}
