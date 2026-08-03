import { discountLimitFor } from "../permissions/discount";
import type { Role } from "../types/role";

export function exceedsDiscountLimit(percent: number, role: Role): boolean {
  return percent > discountLimitFor(role);
}
