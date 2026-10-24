export interface OpaqueField {
  readonly kind: "opaque";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export interface UintField {
  readonly kind: "uint";
  readonly offset: number;
  readonly length: number;
  readonly order: "le" | "be";
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export interface AsciiField {
  readonly kind: "ascii";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export interface TlvField {
  readonly kind: "tlv";
  readonly offset: number;
  readonly length: number;
  readonly tagOffset: number;
  readonly lengthOffset: number;
  readonly valueOffset: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export interface StructField {
  readonly kind: "struct";
  readonly offset: number;
  readonly length: number;
  readonly fields: readonly Field[];
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export type Field =
  | OpaqueField
  | UintField
  | AsciiField
  | TlvField
  | StructField;

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
    root: {
      kind: "opaque",
      offset: 0,
      length: byteLength,
      confidence: 0,
      evidence: [],
    },
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

  switch (field.kind) {
    case "opaque":
      break;

    case "uint":
      if (field.length !== 1 && field.length !== 2 && field.length !== 4 && field.length !== 8) {
        throw new Error(`invalid uint length: ${field.length}`);
      }
      break;

    case "ascii":
      break;

    case "tlv":
      if (
        field.tagOffset < field.offset ||
        field.tagOffset >= field.offset + field.length
      ) {
        throw new Error(`tlv tag offset outside field`);
      }
      if (
        field.lengthOffset < field.offset ||
        field.lengthOffset >= field.offset + field.length
      ) {
        throw new Error(`tlv length offset outside field`);
      }
      if (
        field.valueOffset < field.offset ||
        field.valueOffset >= field.offset + field.length
      ) {
        throw new Error(`tlv value offset outside field`);
      }
      break;

    case "struct": {
      // Validate child fields tile within the struct
      let childCursor = field.offset;
      for (const child of field.fields) {
        if (child.offset < childCursor) {
          throw new Error(`struct child field overlaps or goes backwards`);
        }
        validateField(child, childCursor, field.offset + field.length);
        childCursor = child.offset + child.length;
      }
      if (childCursor !== field.offset + field.length) {
        throw new Error(`struct children do not tile the struct`);
      }
      break;
    }
  }
}
