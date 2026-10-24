import { describe, expect, it } from "vitest";

import { scanPeriodicity } from "../src/scan/periodicity/index";

describe("scanPeriodicity", () => {
  it("detects periodicity in repeating pattern", () => {
    // "ABABABAB" has periodicity at stride 2
    const bytes = new Uint8Array([0x41, 0x42, 0x41, 0x42, 0x41, 0x42, 0x41, 0x42]);
    const hypotheses = scanPeriodicity(bytes);

    expect(hypotheses.length).toBeGreaterThan(0);
    const stride2 = hypotheses.find((h) => h.evidence.some((e) => e.includes("stride 2")));
    expect(stride2).toBeDefined();
    expect(stride2!.confidence).toBeGreaterThan(0);
  });

  it("returns no hypotheses for random bytes", () => {
    // Pseudo-random bytes should not show periodicity
    const bytes = new Uint8Array([
      0x1a, 0x3f, 0x7c, 0x02, 0x8e, 0x41, 0x9d, 0x33,
      0x56, 0x0a, 0xf1, 0x27, 0x84, 0xb2, 0x1e, 0x6d,
    ]);
    const hypotheses = scanPeriodicity(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for empty buffer", () => {
    const hypotheses = scanPeriodicity(new Uint8Array());
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for single byte", () => {
    const hypotheses = scanPeriodicity(new Uint8Array([0x42]));
    expect(hypotheses).toEqual([]);
  });

  it("detects periodicity at stride 1 for uniform bytes", () => {
    const bytes = new Uint8Array(64).fill(0x42);
    const hypotheses = scanPeriodicity(bytes);

    expect(hypotheses.length).toBeGreaterThan(0);
    const stride1 = hypotheses.find((h) => h.evidence.some((e) => e.includes("stride 1")));
    expect(stride1).toBeDefined();
    expect(stride1!.confidence).toBeGreaterThan(0);
  });

  it("reports confidence below 1.0 for imperfect periodicity", () => {
    // Mostly periodic but with some noise
    const bytes = new Uint8Array([
      0x41, 0x42, 0x41, 0x42, 0x41, 0x42, 0x41, 0x42,
      0x41, 0x42, 0x41, 0x42, 0x41, 0x42, 0x41, 0x42,
      0x99, // noise
      0x41, 0x42, 0x41, 0x42, 0x41, 0x42, 0x41, 0x42,
    ]);
    const hypotheses = scanPeriodicity(bytes);

    const stride2 = hypotheses.find((h) => h.evidence.some((e) => e.includes("stride 2")));
    expect(stride2).toBeDefined();
    expect(stride2!.confidence).toBeLessThan(1.0);
    expect(stride2!.confidence).toBeGreaterThan(0);
  });
});
