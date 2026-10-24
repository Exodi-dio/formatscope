import { validateSchema } from "../schema/index";
import type { Field, Schema } from "../schema/index";

export interface OpaqueValue {
  readonly kind: "opaque";
  readonly bytes: Uint8Array;
}

export interface UintValue {
  readonly kind: "uint";
  readonly value: number | bigint;
}

export interface AsciiValue {
  readonly kind: "ascii";
  readonly text: string;
}

export interface TlvValue {
  readonly kind: "tlv";
  readonly tag: number;
  readonly value: Uint8Array;
}

export interface StructValue {
  readonly kind: "struct";
  readonly children: readonly Value[];
}

export type Value = OpaqueValue | UintValue | AsciiValue | TlvValue | StructValue;

export interface Document {
  readonly schema: Schema;
  readonly root: Value;
}

export function decode(schema: Schema, input: Uint8Array): Document {
  validateSchema(schema);

  if (input.byteLength !== schema.byteLength) {
    throw new RangeError(
      `expected ${schema.byteLength} bytes, got ${input.byteLength}`,
    );
  }

  return { schema, root: decodeField(schema.root, input) };
}

export function encode(document: Document): Uint8Array {
  validateSchema(document.schema);

  const output = encodeField(document.root);

  if (output.byteLength !== document.schema.byteLength) {
    throw new RangeError("encoded length does not match schema");
  }

  return output;
}

function decodeField(field: Field, input: Uint8Array): Value {
  switch (field.kind) {
    case "opaque":
      return {
        kind: "opaque",
        bytes: input.slice(field.offset, field.offset + field.length),
      };

    case "uint": {
      return decodeUintField(field, input);
    }

    case "ascii":
      return {
        kind: "ascii",
        text: decodeAscii(input.subarray(field.offset, field.offset + field.length)),
      };

    case "tlv":
      return decodeTlvField(field, input);

    case "struct": {
      return {
        kind: "struct",
        children: field.fields.map((child) => decodeField(child, input)),
      };
    }
  }
}

function encodeField(value: Value): Uint8Array {
  switch (value.kind) {
    case "opaque":
      return value.bytes.slice();

    case "uint":
      return encodeUintValue(value);

    case "ascii":
      return encodeAsciiValue(value);

    case "tlv":
      return encodeTlvValue(value);

    case "struct":
      return concatBytes(value.children.map((child) => encodeField(child)));
  }
}

function decodeUintField(field: UintField, input: Uint8Array): UintValue {
  const bytes = input.subarray(field.offset, field.offset + field.length);
  const isLE = field.order === "le";

  switch (field.length) {
    case 1:
      return { kind: "uint", value: bytes[0]! };
    case 2:
      return { kind: "uint", value: isLE ? readU16LE(bytes) : readU16BE(bytes) };
    case 4:
      return { kind: "uint", value: isLE ? readU32LE(bytes) : readU32BE(bytes) };
    case 8:
      return { kind: "uint", value: isLE ? readU64LE(bytes) : readU64BE(bytes) };
    default:
      throw new Error(`unsupported uint length: ${field.length}`);
  }
}

function encodeUintValue(value: UintValue): Uint8Array {
  if (typeof value.value === "bigint") {
    const bytes = new Uint8Array(8);
    const isLE = true; // default
    writeU64(bytes, 0, value.value, isLE);
    return bytes.subarray(0, 8);
  }

  const num = value.value as number;
  if (num <= 0xff) {
    return new Uint8Array([num]);
  }
  if (num <= 0xffff) {
    const bytes = new Uint8Array(2);
    writeU16(bytes, 0, num, true);
    return bytes;
  }
  if (num <= 0xffffffff) {
    const bytes = new Uint8Array(4);
    writeU32(bytes, 0, num, true);
    return bytes;
  }
  const bytes = new Uint8Array(8);
  writeU64(bytes, 0, BigInt(num), true);
  return bytes;
}

function decodeAscii(bytes: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < bytes.byteLength; i += 1) {
    const b = bytes[i]!;
    if (b >= 0x20 && b <= 0x7e) {
      chars.push(String.fromCharCode(b));
    } else {
      chars.push(".");
    }
  }
  return chars.join("");
}

function encodeAsciiValue(value: AsciiValue): Uint8Array {
  return new TextEncoder().encode(value.text);
}

function decodeTlvField(field: TlvField, input: Uint8Array): TlvValue {
  const tag = input.subarray(field.tagOffset, field.tagOffset + 1)[0]!;
  const valueBytes = input.subarray(field.valueOffset, field.offset + field.length);
  return { kind: "tlv", tag, value: valueBytes.slice() };
}

function encodeTlvValue(value: TlvValue): Uint8Array {
  // Tag (1 byte) + value
  return concatBytes([new Uint8Array([value.tag]), value.value]);
}

// --- Integer read helpers ---

function readU16LE(bytes: Uint8Array): number {
  return bytes[0]! | (bytes[1]! << 8);
}

function readU16BE(bytes: Uint8Array): number {
  return (bytes[0]! << 8) | bytes[1]!;
}

function readU32LE(bytes: Uint8Array): number {
  return (
    bytes[0]! |
    (bytes[1]! << 8) |
    (bytes[2]! << 16) |
    (bytes[3]! << 24)
  );
}

function readU32BE(bytes: Uint8Array): number {
  return (
    (bytes[0]! << 24) |
    (bytes[1]! << 16) |
    (bytes[2]! << 8) |
    bytes[3]!
  );
}

function readU64LE(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < 8; i += 1) {
    result += BigInt(bytes[i]!) << (BigInt(i) * 8n);
  }
  return result;
}

function readU64BE(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < 8; i += 1) {
    result += BigInt(bytes[i]!) << (BigInt(7 - i) * 8n);
  }
  return result;
}

// --- Integer write helpers ---

function writeU16(bytes: Uint8Array, offset: number, value: number, isLE: boolean): void {
  if (isLE) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
  } else {
    bytes[offset] = (value >>> 8) & 0xff;
    bytes[offset + 1] = value & 0xff;
  }
}

function writeU32(bytes: Uint8Array, offset: number, value: number, isLE: boolean): void {
  if (isLE) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
    bytes[offset + 2] = (value >>> 16) & 0xff;
    bytes[offset + 3] = (value >>> 24) & 0xff;
  } else {
    bytes[offset] = (value >>> 24) & 0xff;
    bytes[offset + 1] = (value >>> 16) & 0xff;
    bytes[offset + 2] = (value >>> 8) & 0xff;
    bytes[offset + 3] = value & 0xff;
  }
}

function writeU64(bytes: Uint8Array, offset: number, value: bigint, isLE: boolean): void {
  for (let i = 0; i < 8; i += 1) {
    const shift = isLE ? BigInt(i) * 8n : BigInt(7 - i) * 8n;
    bytes[offset + i] = Number((value >> shift) & 0xffn);
  }
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
