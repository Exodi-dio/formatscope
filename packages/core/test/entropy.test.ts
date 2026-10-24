import { describe, expect, it } from "vitest";

import { scanEntropy, type EntropyRegion } from "../src/scan/entropy/index";

describe("scanEntropy", () => {
  it("returns no regions for an empty buffer", () => {
    expect(scanEntropy(new Uint8Array(), 16)).toEqual([]);
  });

  it("returns zero entropy for uniform bytes", () => {
    const regions = scanEntropy(new Uint8Array(64).fill(0x42), 16);

    expect(regions).toHaveLength(4);
    for (const region of regions) {
      expect(region.entropy).toBe(0);
    }
  });

  it("returns near-max entropy for uniformly random bytes", () => {
    const regions = scanEntropy(
      new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
      16,
    );

    const first = regions[0];

    expect(regions).toHaveLength(1);
    expect(first).toBeDefined();
    if (first) {
      expect(first.entropy).toBeGreaterThan(3.9);
      expect(first.entropy).toBeLessThanOrEqual(4);
    }
  });

  it("tiles the buffer with full coverage", () => {
    const regions = scanEntropy(
      new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]),
      4,
    );

    let covered = 0;
    for (const region of regions) {
      covered += region.length;
    }
    expect(covered).toBe(16);
  });

  it("reports correct offset and length per region", () => {
    const regions = scanEntropy(
      new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1]),
      4,
    );

    const first = regions[0];
    const second = regions[1];

    expect(first!).toEqual({ offset: 0, length: 4, entropy: 0 });
    expect(second!).toEqual({ offset: 4, length: 4, entropy: 0 });
  });

  it("clamps window size to the buffer length", () => {
    const regions = scanEntropy(new Uint8Array([0, 1, 2, 3]), 16);

    expect(regions).toHaveLength(1);
    expect(regions[0].offset).toBe(0);
    expect(regions[0].length).toBe(4);
  });
});
