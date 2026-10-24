import { describe, expect, it } from "vitest";

import { scanStrings } from "../src/scan/strings/index";

describe("scanStrings", () => {
  it("finds a printable ASCII run", () => {
    const bytes = new Uint8Array([0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00]);
    const hypotheses = scanStrings(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]).toEqual({
      kind: "string",
      offset: 1,
      length: 5,
      confidence: 0.60,
      evidence: ["printable run of 5 bytes at offset 1"],
    });
  });

  it("finds multiple string runs", () => {
    const bytes = new Uint8Array([
      0x48, 0x65, 0x6c, 0x6c, 0x6f, // "Hello"
      0x00,
      0x57, 0x6f, 0x72, 0x6c, 0x64, // "World"
      0x00,
    ]);
    const hypotheses = scanStrings(bytes);

    expect(hypotheses).toHaveLength(2);
    expect(hypotheses[0]!.offset).toBe(0);
    expect(hypotheses[0]!.length).toBe(5);
    expect(hypotheses[1]!.offset).toBe(6);
    expect(hypotheses[1]!.length).toBe(5);
  });

  it("ignores runs shorter than minimum length", () => {
    const bytes = new Uint8Array([0x41, 0x42, 0x00]); // "AB" only, length 2
    const hypotheses = scanStrings(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for empty buffer", () => {
    const hypotheses = scanStrings(new Uint8Array());
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for non-printable buffer", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x80, 0xff]);
    const hypotheses = scanStrings(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("handles string run at end of buffer", () => {
    const bytes = new Uint8Array([0x00, 0x46, 0x4f, 0x4f, 0x44]); // "FooD" at end
    const hypotheses = scanStrings(bytes);
    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.offset).toBe(1);
    expect(hypotheses[0]!.length).toBe(4);
  });
});
