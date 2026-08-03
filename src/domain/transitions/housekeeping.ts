import type { HousekeepingStatus } from "../types/status";

const ALLOWED: Record<HousekeepingStatus, HousekeepingStatus[]> = {
  DIRTY: ["CLEANING"],
  CLEANING: ["CLEAN"],
  CLEAN: ["INSPECTED"],
  INSPECTED: [],
};

export function canTransitionHousekeeping(from: HousekeepingStatus, to: HousekeepingStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}
