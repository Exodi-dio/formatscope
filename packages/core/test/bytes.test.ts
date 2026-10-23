import { describe, expect, it } from "vitest";

import { ByteReader, firstDifference } from "../src/index";

describe("ByteReader", () => {
  it("reads little- and big-endian integers", () => {
    const reader = new ByteReader(
      new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]),
    );

    expect(reader.u8(7)).toBe(0x08);
    expect(reader.u16(0, "le")).toBe(0x0201);
    expect(reader.u16(0, "be")).toBe(0x0102);
    expect(reader.u32(0, "le")).toBe(0x04030201);
    expect(reader.u32(4, "be")).toBe(0x05060708);
    expect(reader.u64(0, "le")).toBe(0x0807060504030201n);
  });

  it("rejects reads outside the buffer", () => {
    const reader = new ByteReader(new Uint8Array(4));

    expect(() => reader.u8(4)).toThrow(RangeError);
    expect(() => reader.u16(3, "le")).toThrow(RangeError);
    expect(() => reader.u32(-1, "le")).toThrow(RangeError);
    expect(() => reader.slice(2, 3)).toThrow(RangeError);
    expect(() => reader.u16(1.5, "le")).toThrow(RangeError);
  });

  it("views share memory and copies do not", () => {
    const source = new Uint8Array([1, 2, 3, 4]);
    const reader = new ByteReader(source);
    const view = reader.slice(1, 2);
    const copy = reader.copy(1, 2);

    source[1] = 0xff;

    expect([...view]).toEqual([0xff, 3]);
    expect([...copy]).toEqual([2, 3]);
  });
});

describe("firstDifference", () => {
  it("returns null for equal buffers", () => {
    expect(firstDifference(new Uint8Array(), new Uint8Array())).toBeNull();
    expect(
      firstDifference(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])),
    ).toBeNull();
  });

  it("returns the first differing index", () => {
    expect(
      firstDifference(new Uint8Array([1, 2, 3]), new Uint8Array([1, 9, 3])),
    ).toBe(1);
  });

  it("returns the shared length for length mismatches", () => {
    expect(firstDifference(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(2);
    expect(firstDifference(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2]))).toBe(2);
  });
});
