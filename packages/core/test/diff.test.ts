import { describe, expect, it } from "vitest";

import { diff } from "../src/diff/index";
import { type Document } from "../src/index";

type AnyField = {
  kind: string;
  offset: number;
  length: number;
  confidence?: number;
  evidence?: readonly string[];
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

function makeSchema(
  fields: readonly AnyField[],
  totalLength: number,
): { version: 1; byteLength: number; root: any } { // eslint-disable-line @typescript-eslint/no-explicit-any
  const root: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    kind: "struct",
    offset: 0,
    length: totalLength,
    confidence: 0,
    evidence: [],
    fields: fields.map((f) => ({
      ...f,
      confidence: 0,
      evidence: [],
    })),
  };
  return { version: 1, byteLength: totalLength, root } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function makeDoc(schema: any, values: any[]): Document { // eslint-disable-line @typescript-eslint/no-explicit-any
  const root: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    kind: "struct",
    children: values.map((v, i) => {
      const f = schema.root.fields[i];
      switch (f.kind) {
        case "uint":
          return { kind: "uint", value: v };
        case "ascii":
          return { kind: "ascii", text: String(v) };
        case "opaque":
          return { kind: "opaque", bytes: new Uint8Array([v]) };
        default:
          return { kind: "opaque", bytes: new Uint8Array([0]) };
      }
    }),
  };
  return { schema, root } as Document;
}

describe("diff", () => {
  it("returns empty diff for identical documents", () => {
    const schema = makeSchema(
      [{ kind: "uint", offset: 0, length: 4 }],
      4,
    );
    const a = makeDoc(schema, [42]);
    const b = makeDoc(schema, [42]);

    const result = diff(a, b);

    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      changed: 0,
      unchanged: 2,
    });
  });

  it("detects changed value", () => {
    const schema = makeSchema(
      [{ kind: "uint", offset: 0, length: 4 }],
      4,
    );
    const a = makeDoc(schema, [42]);
    const b = makeDoc(schema, [43]);

    const result = diff(a, b);

    expect(result.summary.changed).toBe(1);
    const change = result.changes.find((c) => c.kind === "changed");
    expect(change).toBeDefined();
    expect(change!.oldValue).toBe("42");
    expect(change!.newValue).toBe("43");
  });

  it("detects added field", () => {
    const schemaA = makeSchema(
      [{ kind: "uint", offset: 0, length: 4 }],
      4,
    );
    const schemaB = makeSchema(
      [
        { kind: "uint", offset: 0, length: 4 },
        { kind: "ascii", offset: 4, length: 3 },
      ],
      7,
    );
    const a = makeDoc(schemaA, [42]);
    const b = makeDoc(schemaB, [42, "abc"]);

    const result = diff(a, b);

    expect(result.summary.added).toBeGreaterThan(0);
  });

  it("detects removed field", () => {
    const schemaA = makeSchema(
      [
        { kind: "uint", offset: 0, length: 4 },
        { kind: "ascii", offset: 4, length: 3 },
      ],
      7,
    );
    const schemaB = makeSchema(
      [{ kind: "uint", offset: 0, length: 4 }],
      4,
    );
    const a = makeDoc(schemaA, [42, "abc"]);
    const b = makeDoc(schemaB, [42]);

    const result = diff(a, b);

    expect(result.summary.removed).toBeGreaterThan(0);
  });

  it("handles null documents", () => {
    const result = diff(null, null);
    expect(result.summary.added).toBe(0);
    expect(result.summary.removed).toBe(0);
    expect(result.summary.changed).toBe(0);
    expect(result.summary.unchanged).toBe(0);
  });
});
