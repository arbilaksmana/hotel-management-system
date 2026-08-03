import { describe, expect, it } from "vitest";
import { assertTransition, canTransitionReservation } from "@/domain/transitions/reservation";

describe("transisi reservasi (PRD 9.1)", () => {
  it("mengizinkan transisi yang sah", () => {
    expect(canTransitionReservation("HOLD", "PENDING_PAYMENT")).toBe(true);
    expect(canTransitionReservation("CONFIRMED", "CHECKED_IN")).toBe(true);
  });
  it("menolak transisi ilegal", () => {
    expect(canTransitionReservation("HOLD", "CHECKED_OUT")).toBe(false);
    expect(() => assertTransition("CANCELLED", "CHECKED_IN")).toThrow();
  });
});
