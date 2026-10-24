import { describe, expect, it } from "vitest";

import {
  opaqueSchema,
  validateSchema,
  type Schema,
} from "../src/index";

describe("validateSchema", () => {
  it("accepts a valid opaque schema", () => {
    const schema = opaqueSchema(16);
    expect(() => validateSchema(schema)).not.toThrow();
  });

  it("rejects offset that does not tile from start", () => {
    const schema: Schema = {
      version: 1,
      byteLength: 16,
      root: {
        kind: "opaque",
        offset: 4,
        length: 12,
        confidence: 0,
        evidence: [],
      },
    };
    expect(() => validateSchema(schema)).toThrow(/tile from/);
  });

  it("rejects offset+length that does not tile to end", () => {
    const schema: Schema = {
      version: 1,
      byteLength: 16,
      root: {
        kind: "opaque",
        offset: 0,
        length: 12,
        confidence: 0,
        evidence: [],
      },
    };
    expect(() => validateSchema(schema)).toThrow(/tile to/);
  });

  it("rejects unknown field kind", () => {
    const schema = {
      version: 1,
      byteLength: 4,
      root: {
        kind: "unknown",
        offset: 0,
        length: 4,
        confidence: 0,
        evidence: [],
      },
    } as unknown as Schema;
    expect(() => validateSchema(schema)).toThrow(/unsupported field kind/);
  });

  it("rejects invalid uint length", () => {
    const schema: Schema = {
      version: 1,
      byteLength: 3,
      root: {
        kind: "uint",
        offset: 0,
        length: 3,
        order: "le",
        confidence: 0,
        evidence: [],
      },
    };
    expect(() => validateSchema(schema)).toThrow(/invalid uint length/);
  });

  it("accepts a struct with tiling children", () => {
    const schema: Schema = {
      version: 1,
      byteLength: 16,
      root: {
        kind: "struct",
        offset: 0,
        length: 16,
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
            kind: "opaque",
            offset: 4,
            length: 12,
            confidence: 0,
            evidence: [],
          },
        ],
      },
    };
    expect(() => validateSchema(schema)).not.toThrow();
  });

  it("rejects struct children that do not tile", () => {
    const schema: Schema = {
      version: 1,
      byteLength: 16,
      root: {
        kind: "struct",
        offset: 0,
        length: 16,
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
            kind: "opaque",
            offset: 8,
            length: 8,
            confidence: 0,
            evidence: [],
          }, // gap at 4-8
        ],
      },
    };
    expect(() => validateSchema(schema)).toThrow(/tile from/);
  });
});
