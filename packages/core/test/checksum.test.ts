import { describe, expect, it } from "vitest";

import { scanChecksum } from "../src/scan/checksum/index";

function u32LE(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = value & 0xff;
  out[1] = (value >>> 8) & 0xff;
  out[2] = (value >>> 16) & 0xff;
  out[3] = (value >>> 24) & 0xff;
  return out;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.byteLength; i += 1) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j += 1) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

describe("scanChecksum", () => {
  it("detects valid CRC32 at end of file", () => {
    const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
    const checksum = crc32(data);
    const bytes = concatBytes([data, u32LE(checksum)]);
    const hypotheses = scanChecksum(bytes);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0].offset).toBe(0);
    expect(hypotheses[0].length).toBe(bytes.byteLength);
    expect(hypotheses[0].confidence).toBe(0.98); // D18: verified checksum → 0.98
  });

  it("returns no hypotheses for invalid checksum", () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const bytes = concatBytes([data, u32LE(0xdeadbeef)]);
    const hypotheses = scanChecksum(bytes);
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for empty buffer", () => {
    const hypotheses = scanChecksum(new Uint8Array());
    expect(hypotheses).toEqual([]);
  });

  it("returns no hypotheses for buffer too small", () => {
    const hypotheses = scanChecksum(new Uint8Array([0x01, 0x02, 0x03]));
    expect(hypotheses).toEqual([]);
  });
});

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
