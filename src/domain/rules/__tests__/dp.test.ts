import { describe, expect, it } from "vitest";
import { dpShortfall, dpThreshold } from "@/domain/rules/dp";
import { policy } from "@/data/seed";

describe("aturan DP (PRD 5.1)", () => {
  it("mengikuti nilai terbesar antara 30% dan satu malam", () => {
    // total 1.000.000, harga malam 650.000 -> 30% = 300.000, 1 malam = 650.000 -> ambil 650.000
    expect(dpThreshold(1_000_000, 650_000, policy)).toBe(650_000);
    // total 3.000.000, harga malam 500.000 -> 30% = 900.000 -> ambil 900.000
    expect(dpThreshold(3_000_000, 500_000, policy)).toBe(900_000);
  });
  it("shortfall nol bila DP terpenuhi", () => {
    expect(dpShortfall(1_000_000, 650_000, 650_000, policy)).toBe(0);
    expect(dpShortfall(1_000_000, 650_000, 100_000, policy)).toBe(550_000);
  });
});
