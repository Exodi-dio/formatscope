import { describe, expect, it } from "vitest";

import {
  decode,
  encode,
  opaqueSchema,
  verifyBytes,
  type Document,
} from "../src/index";

function u32LE(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = value & 0xff;
  out[1] = (value >>> 8) & 0xff;
  out[2] = (value >>> 16) & 0xff;
  out[3] = (value >>> 24) & 0xff;
  return out;
}

describe("interp decode/encode", () => {
  it("decodes and encodes opaque field", () => {
    const input = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const schema = opaqueSchema(4);
    const doc = decode(schema, input);
    const output = encode(doc);

    expect([...output]).toEqual([...input]);
    expect(verifyBytes(input, output).ok).toBe(true);
  });

  it("decodes uint LE field", () => {
    const input = new Uint8Array([0x11, 0x22, 0x33, 0x44]);
    const schema: Document["schema"] = {
      version: 1,
      byteLength: 4,
      root: {
        kind: "uint",
        offset: 0,
        length: 4,
        order: "le",
        confidence: 0,
        evidence: [],
      },
    };
    const doc = decode(schema, input);
    expect(doc.root.kind).toBe("uint");
    if (doc.root.kind === "uint") {
      expect(doc.root.value).toBe(0x44332211);
    }

    const output = encode(doc);
    expect([...output]).toEqual([...input]);
  });

  it("decodes uint BE field", () => {
    const input = new Uint8Array([0x11, 0x22, 0x33, 0x44]);
    const schema: Document["schema"] = {
      version: 1,
      byteLength: 4,
      root: {
        kind: "uint",
        offset: 0,
        length: 4,
        order: "be",
        confidence: 0,
        evidence: [],
      },
    };
    const doc = decode(schema, input);
    if (doc.root.kind === "uint") {
      expect(doc.root.value).toBe(0x11223344);
    }
  });

  it("decodes ascii field", () => {
    const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const schema: Document["schema"] = {
      version: 1,
      byteLength: 5,
      root: {
        kind: "ascii",
        offset: 0,
        length: 5,
        confidence: 0,
        evidence: [],
      },
    };
    const doc = decode(schema, input);
    expect(doc.root.kind).toBe("ascii");
    if (doc.root.kind === "ascii") {
      expect(doc.root.text).toBe("Hello");
    }
  });

  it("decodes struct with children", () => {
    const input = new Uint8Array([
      0x10, 0x00, 0x00, 0x00, // uint32 LE = 16
      0x41, 0x42, 0x43, 0x44, // "ABCD"
      0x00, 0x00, 0x00, 0x00, // padding
    ]);
    const schema: Document["schema"] = {
      version: 1,
      byteLength: 12,
      root: {
        kind: "struct",
        offset: 0,
        length: 12,
        confidence: 0,
        evidence: [],
        fields: [
          {
            kind: "uint",
            offset: 0,
            length: 4,
            order: "le",
            confidence: 0,
            evidence: [],
          },
          {
            kind: "ascii",
            offset: 4,
            length: 4,
            confidence: 0,
            evidence: [],
          },
          {
            kind: "opaque",
            offset: 8,
            length: 4,
            confidence: 0,
            evidence: [],
          },
        ],
      },
    };
    const doc = decode(schema, input);
    expect(doc.root.kind).toBe("struct");
    if (doc.root.kind === "struct") {
      expect(doc.root.children).toHaveLength(3);
    }
  });

  it("encodes struct back to original bytes", () => {
    const input = new Uint8Array([
      0x10, 0x00, 0x00, 0x00,
      0x41, 0x42, 0x43, 0x44,
      0x00, 0x00, 0x00, 0x00,
    ]);
    const schema: Document["schema"] = {
      version: 1,
      byteLength: 12,
      root: {
        kind: "struct",
        offset: 0,
        length: 12,
        confidence: 0,
        evidence: [],
        fields: [
          {
            kind: "uint",
            offset: 0,
            length: 4,
            order: "le",
            confidence: 0,
            evidence: [],
          },
          {
            kind: "ascii",
            offset: 4,
            length: 4,
            confidence: 0,
            evidence: [],
          },
          {
            kind: "opaque",
            offset: 8,
            length: 4,
            confidence: 0,
            evidence: [],
          },
        ],
      },
    };
    const doc = decode(schema, input);
    const output = encode(doc);
    expect([...output]).toEqual([...input]);
  });

  it("rejects decode when input length does not match schema", () => {
    const schema = opaqueSchema(4);
    expect(() => decode(schema, new Uint8Array(3))).toThrow(RangeError);
  });

  it("rejects encode when value length does not match schema", () => {
    const schema = opaqueSchema(4);
    const doc: Document = {
      schema,
      root: { kind: "opaque", bytes: new Uint8Array([0x01, 0x02]) },
    };
    expect(() => encode(doc)).toThrow(RangeError);
  });
});
