export interface NodeLineEntry {
  readonly path: string;
  readonly line: number;
}

import type { Field, Schema } from "../schema/index";

const lines: string[] = [];
const nodeMap: NodeLineEntry[] = [];

function emit(text: string): void {
  lines.push(text);
}

function track(path: string): void {
  nodeMap.push({ path, line: lines.length - 1 });
}

function fieldSource(field: Field, path: string): string {
  track(path);
  switch (field.kind) {
    case "opaque":
      return `{ kind: "opaque", offset: ${field.offset}, length: ${field.length} }`;
    case "uint":
      return `{ kind: "uint", offset: ${field.offset}, length: ${field.length}, order: "${field.order}" }`;
    case "ascii":
      return `{ kind: "ascii", offset: ${field.offset}, length: ${field.length} }`;
    case "tlv":
      return `{ kind: "tlv", offset: ${field.offset}, length: ${field.length}, tagOffset: ${field.tagOffset}, lengthOffset: ${field.lengthOffset}, valueOffset: ${field.valueOffset} }`;
    case "struct": {
      const children = field.fields
        .map((c, i) => `    ${fieldSource(c, `${path}.fields[${i}]`)}`)
        .join(",\n");
      return `{ kind: "struct", offset: ${field.offset}, length: ${field.length}, fields: [\n${children}\n  ] }`;
    }
    default:
      throw new Error("unsupported field kind");
  }
}

export function codegen(schema: Schema): {
  source: string;
  nodeMap: readonly NodeLineEntry[];
} {
  lines.length = 0;
  nodeMap.length = 0;

  // Header
  emit("// FormatScope generated parser");
  emit(`// Schema version: ${schema.version}, source length: ${schema.byteLength}`);
  emit("");
  emit("import { ByteReader } from \"../bytes\";");
  emit("");

  // Types
  emit("export interface Document {");
  emit("  root: RootValue;");
  emit("}");
  emit("");
  emit("export interface RootValue {");
  emit("  kind: string;");
  emit("  [key: string]: any;");
  emit("}");
  emit("");

  // Parse
  emit("export function parse(input: Uint8Array): Document {");
  emit("  const reader = new ByteReader(input);");
  emit("  const root = parseField(schema.root, reader);");
  emit("  return { root };");
  emit("}");
  emit("");

  // Schema root node map tracking
  emit("const schemaRoot = buildSchemaRoot();");
  emit("");
  emit("function buildSchemaRoot(): any {");
  emit("  return {");
  emit(fieldSource(schema.root, "root"));
  emit("  };");
  emit("}");
  emit("");

  // Parse field dispatcher
  emit("function parseField(field: any, reader: ByteReader): any {");
  emit("  switch (field.kind) {");
  emit("    case \"opaque\":");
  emit("      return reader.slice(field.offset, field.offset + field.length);");
  emit("    case \"uint\":");
  emit("      return reader[`readUInt${field.order === \"le\" ? \"LE\" : \"BE\"}`](field.offset, field.length);");
  emit("    case \"ascii\":");
  emit("      return reader.slice(field.offset, field.offset + field.length).toString(\"latin1\");");
  emit("    case \"tlv\":");
  emit("      return { tag: reader.u8(field.tagOffset), value: reader.slice(field.valueOffset, field.offset + field.length) };");
  emit("    case \"struct\":");
  emit("      return { kind: \"struct\", children: field.fields.map(f => parseField(f, reader)); };");
  emit("    default:");
  emit("      throw new Error(`unsupported field kind: ${field.kind}`);");
  emit("  }");
  emit("}");
  emit("");

  // Serialize
  emit("export function serialize(doc: Document): Uint8Array {");
  emit("  const chunks: Uint8Array[] = [];");
  emit("  serializeField(doc.root, chunks);");
  emit("  return concatBytes(chunks);");
  emit("}");
  emit("");

  emit("function serializeField(value: any, chunks: Uint8Array[]): void {");
  emit("  switch (value.kind) {");
  emit("    case \"opaque\":");
  emit("      chunks.push(value.bytes);");
  emit("      break;");
  emit("    case \"uint\":");
  emit("      chunks.push(encodeUInt(value.value, 8));");
  emit("      break;");
  emit("    case \"ascii\":");
  emit("      chunks.push(new TextEncoder().encode(value.text));");
  emit("      break;");
  emit("    case \"tlv\":");
  emit("      chunks.push(new Uint8Array([value.tag, value.value.length]));");
  emit("      chunks.push(value.value);");
  emit("      break;");
  emit("    case \"struct\":");
  emit("      value.children.forEach(c => serializeField(c, chunks));");
  emit("      break;");
  emit("  }");
  emit("}");
  emit("");

  // Helpers
  emit("function concatBytes(parts: Uint8Array[]): Uint8Array {");
  emit("  let total = 0;");
  emit("  for (const part of parts) total += part.length;");
  emit("  const out = new Uint8Array(total);");
  emit("  let offset = 0;");
  emit("  for (const part of parts) { out.set(part, offset); offset += part.length; }");
  emit("  return out;");
  emit("}");
  emit("");
  emit("function encodeUInt(value: number | bigint, len: number): Uint8Array {");
  emit("  const bytes = new Uint8Array(len);");
  emit("  const n = typeof value === \"bigint\" ? Number(value) : value;");
  emit("  for (let i = 0; i < len; i += 1) {");
  emit("    bytes[len - 1 - i] = (n >>> (i * 8)) & 0xff;");
  emit("  }");
  emit("  return bytes;");
  emit("}");

  const source = lines.join("\n");
  return { source, nodeMap: [...nodeMap] };
}
