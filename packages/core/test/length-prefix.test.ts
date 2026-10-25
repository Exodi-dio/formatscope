import { describe, expect, it } from "vitest";

import { scanLengthPrefix } from "../src/scan/length-prefix/index";

function u32LE(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = value & 0xff;
  out[1] = (value >>> 8) & 0xff;
  out[2] = (value >>> 16) & 0xff;
  out[3] = (value >>> 24) & 0xff;
  return out;
}

function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) total += part.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

describe("scanLengthPrefix", () => {
  it("detects valid length prefix", () => {
    // offset 0: u32 LE = 8, meaning 8 bytes of payload follow at offset 4
    // u16 LE at offset 0 = 8, also matches
    const bytes = concatBytes([u32LE(8), new Uint8Array(8)]);
    const hypotheses = scanLengthPrefix(bytes);

    expect(hypotheses).toHaveLength(2);
    // u32: offset 0, length 12 (4 header + 8 payload)
    // u16: offset 0, length 10 (2 header + 8 payload)
    const byLength = [...hypotheses].sort((a, b) => a.length - b.length);
    expect(byLength[0]!.offset).toBe(0);
    expect(byLength[0]!.length).toBe(10);
    expect(byLength[1]!.offset).toBe(0);
    expect(byLength[1]!.length).toBe(12);
    expect(byLength[0]!.confidence).toBeGreaterThan(0);
    expect(byLength[1]!.confidence).toBeGreaterThan(0);
  });

  it("rejects length that points past file end", () => {
    const bytes = concatBytes([u32LE(1000), new Uint8Array(4)]);
    const hypotheses = scanLengthPrefix(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("rejects non-4-byte-aligned length", () => {
    // u32 LE = 5 (not 4-byte aligned), u16 LE = 5 (length 7, fits in 10 bytes)
    const bytes = concatBytes([u32LE(5), new Uint8Array(5)]);
    const hypotheses = scanLengthPrefix(bytes);
    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.offset).toBe(0);
    expect(hypotheses[0]!.length).toBe(7); // 2 header + 5 payload
  });

  it("returns no hypotheses for empty buffer", () => {
    const hypotheses = scanLengthPrefix(new Uint8Array());
    expect(hypotheses).toEqual([]);
  });

  it("finds multiple length-prefixed records", () => {
    // Record 1: offset 0, length 4, payload at offset 4
    // Record 2: offset 12, length 4, payload at offset 16
    const payload1 = new Uint8Array(4);
    const payload2 = new Uint8Array(4);
    const bytes = concatBytes([u32LE(4), payload1, u32LE(4), payload2]);
    const hypotheses = scanLengthPrefix(bytes);

    expect(hypotheses.length).toBeGreaterThanOrEqual(1);
    // First record at offset 0
    const first = hypotheses.find((h) => h.offset === 0);
    expect(first).toBeDefined();
    expect(first!.length).toBe(8); // 4 (header) + 4 (payload)
  });
});
