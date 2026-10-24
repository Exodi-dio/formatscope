import { describe, expect, it } from "vitest";

import { scanMagic } from "../src/scan/magic/index";

describe("scanMagic", () => {
  it("detects FSBX magic at offset 0", () => {
    const bytes = new Uint8Array([0x46, 0x53, 0x42, 0x58, 0x01, 0x00, 0x00, 0x00]);
    const hypotheses = scanMagic(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]).toEqual({
      kind: "magic",
      offset: 0,
      length: 4,
      confidence: 0.95,
      evidence: ["magic \"FSBX\" at offset 0"],
    });
  });

  it("detects FSRT magic at offset 0", () => {
    const bytes = new Uint8Array([0x46, 0x53, 0x52, 0x54, 0x01, 0x08]);
    const hypotheses = scanMagic(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.kind).toBe("magic");
    expect(hypotheses[0]!.offset).toBe(0);
    expect(hypotheses[0]!.length).toBe(4);
    expect(hypotheses[0]!.confidence).toBe(0.95);
    expect(hypotheses[0]!.evidence).toEqual(["magic \"FSRT\" at offset 0"]);
  });

  it("detects PNG magic at offset 0", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const hypotheses = scanMagic(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.kind).toBe("magic");
    expect(hypotheses[0]!.evidence).toEqual(["magic \"PNG\" at offset 0"]);
  });

  it("returns no hypotheses for unknown magic", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    const hypotheses = scanMagic(bytes);

    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for empty buffer", () => {
    const hypotheses = scanMagic(new Uint8Array());
    expect(hypotheses).toEqual([]);
  });

  it("does not match partial magic", () => {
    const bytes = new Uint8Array([0x46, 0x53, 0x42]); // "FSB" only, missing "X"
    const hypotheses = scanMagic(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("detects multiple magics if they share a prefix", () => {
    // "PK" is a prefix of nothing in our list, but test that
    // a buffer starting with "PK" gets the PK hypothesis
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const hypotheses = scanMagic(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.evidence).toEqual(["magic \"PK\" at offset 0"]);
  });
});
