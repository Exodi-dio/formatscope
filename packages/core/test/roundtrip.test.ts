import { describe, expect, it } from "vitest";

import {
  decode,
  encode,
  opaqueSchema,
  validateSchema,
  verifyBytes,
  verifyRoundTrip,
} from "../src/index";
import type { Schema } from "../src/index";

function pseudoRandom(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let state = seed >>> 0;

  for (let index = 0; index < length; index += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    out[index] = state >>> 24;
  }

  return out;
}

const cases: readonly Uint8Array[] = [
  new Uint8Array(),
  new Uint8Array([0x00]),
  Uint8Array.from({ length: 256 }, (_, index) => index),
  pseudoRandom(4096, 0x5eed),
];

describe("opaque schema", () => {
  it("round-trips every byte exactly", () => {
    for (const input of cases) {
      const schema = opaqueSchema(input.length);
      const output = encode(decode(schema, input));

      expect([...output]).toEqual([...input]);
      expect(verifyRoundTrip(schema, input)).toEqual({
        ok: true,
        firstDiffOffset: null,
        inputLength: input.length,
        outputLength: input.length,
      });
    }
  });

  it("rejects input that does not match the declared length", () => {
    expect(() => decode(opaqueSchema(4), new Uint8Array(3))).toThrow(RangeError);
  });

  it("rejects a root that does not tile the file", () => {
    expect(() =>
      validateSchema({
        version: 1,
        byteLength: 4,
        root: { kind: "opaque", offset: 0, length: 3 },
      }),
    ).toThrow(/tile/);

    expect(() =>
      validateSchema({
        version: 1,
        byteLength: 4,
        root: { kind: "opaque", offset: 1, length: 4 },
      }),
    ).toThrow();
  });

  it("rejects an unknown schema version", () => {
    const schema = {
      version: 2,
      byteLength: 0,
      root: { kind: "opaque", offset: 0, length: 0 },
    } as unknown as Schema;

    expect(() => validateSchema(schema)).toThrow(/version/);
  });
});

describe("verifyBytes", () => {
  it("reports the first differing byte", () => {
    expect(verifyBytes(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toEqual({
      ok: false,
      firstDiffOffset: 2,
      inputLength: 3,
      outputLength: 3,
    });
  });

  it("reports the length mismatch offset", () => {
    expect(verifyBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toEqual({
      ok: false,
      firstDiffOffset: 2,
      inputLength: 2,
      outputLength: 3,
    });
  });
});
