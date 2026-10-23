import { validateSchema } from "../schema/index";
import type { Field, Schema } from "../schema/index";

export interface OpaqueValue {
  readonly kind: "opaque";
  readonly bytes: Uint8Array;
}

export type Value = OpaqueValue;

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

  if (document.root.bytes.byteLength !== document.schema.root.length) {
    throw new RangeError("value length does not match schema");
  }

  return document.root.bytes.slice();
}

function decodeField(field: Field, input: Uint8Array): Value {
  return {
    kind: "opaque",
    bytes: input.slice(field.offset, field.offset + field.length),
  };
}
