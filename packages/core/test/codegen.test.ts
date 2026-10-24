import { describe, expect, it } from "vitest";

import { codegen, type CodegenResult } from "../src/codegen/index";
import { opaqueSchema } from "../src/index";

describe("codegen", () => {
  it("produces source with header comment", () => {
    const schema = opaqueSchema(16);
    const result = codegen(schema);

    expect(result.source).toContain("// FormatScope generated parser");
    expect(result.source).toContain("// Schema version: 1, source length: 16");
  });

  it("produces node map covering root node", () => {
    const schema = opaqueSchema(16);
    const result = codegen(schema);

    expect(result.nodeMap.length).toBeGreaterThan(0);
    const first = result.nodeMap[0]!;
    expect(first.path).toBe("root");
    expect(typeof first.line).toBe("number");
    expect(first.line).toBeGreaterThanOrEqual(0);
  });

  it("produces valid TypeScript source", () => {
    const schema = opaqueSchema(4);
    const result = codegen(schema);

    expect(result.source).toContain("export function parse");
    expect(result.source).toContain("export function serialize");
    expect(result.source).toContain("ByteReader");
    expect(result.source).toContain("schemaRoot");
  });

  it("node map lines are within source bounds", () => {
    const schema = opaqueSchema(8);
    const result = codegen(schema);
    const lineCount = result.source.split("\n").length;

    for (const entry of result.nodeMap) {
      expect(entry.line).toBeLessThan(lineCount);
    }
  });

  it("is deterministic: same schema produces same source", () => {
    const schema = opaqueSchema(32);
    const a = codegen(schema);
    const b = codegen(schema);

    expect(a.source).toBe(b.source);
    expect(a.nodeMap).toEqual(b.nodeMap);
  });

  it("generates different code for different schemas", () => {
    const a = codegen(opaqueSchema(4));
    const b = codegen(opaqueSchema(8));

    expect(a.source).not.toBe(b.source);
  });
});
