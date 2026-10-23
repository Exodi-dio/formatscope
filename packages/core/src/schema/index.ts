export interface OpaqueField {
  readonly kind: "opaque";
  readonly offset: number;
  readonly length: number;
}

export type Field = OpaqueField;

export interface Schema {
  readonly version: 1;
  readonly byteLength: number;
  readonly root: Field;
}

export function opaqueSchema(byteLength: number): Schema {
  if (!Number.isInteger(byteLength) || byteLength < 0) {
    throw new RangeError(`invalid byte length: ${byteLength}`);
  }

  return {
    version: 1,
    byteLength,
    root: { kind: "opaque", offset: 0, length: byteLength },
  };
}

export function validateSchema(schema: Schema): void {
  if (schema.version !== 1) {
    throw new Error(`unsupported schema version: ${String(schema.version)}`);
  }

  if (!Number.isInteger(schema.byteLength) || schema.byteLength < 0) {
    throw new RangeError(`invalid schema byte length: ${schema.byteLength}`);
  }

  validateField(schema.root, 0, schema.byteLength);
}

function validateField(field: Field, start: number, end: number): void {
  if (field.kind !== "opaque") {
    throw new Error(`unsupported field kind: ${String(field.kind)}`);
  }

  if (
    !Number.isInteger(field.offset) ||
    !Number.isInteger(field.length) ||
    field.length < 0
  ) {
    throw new RangeError(`invalid field range: ${field.offset}+${field.length}`);
  }

  if (field.offset !== start) {
    throw new Error(`field does not tile from offset ${start}`);
  }

  if (field.offset + field.length !== end) {
    throw new Error(`field does not tile to offset ${end}`);
  }
}
