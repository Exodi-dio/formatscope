export type ByteOrder = "le" | "be";

export class ByteReader {
  readonly bytes: Uint8Array;
  readonly length: number;
  readonly #view: DataView;

  constructor(source: Uint8Array | ArrayBuffer) {
    this.bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
    this.length = this.bytes.byteLength;
    this.#view = new DataView(
      this.bytes.buffer,
      this.bytes.byteOffset,
      this.bytes.byteLength,
    );
  }

  #check(offset: number, size: number): void {
    if (!Number.isInteger(offset) || offset < 0) {
      throw new RangeError(`invalid offset: ${offset}`);
    }

    if (!Number.isInteger(size) || size < 0) {
      throw new RangeError(`invalid size: ${size}`);
    }

    if (offset + size > this.length) {
      throw new RangeError(`read past end at ${offset} (+${size})`);
    }
  }

  u8(offset: number): number {
    this.#check(offset, 1);
    return this.#view.getUint8(offset);
  }

  u16(offset: number, order: ByteOrder = "le"): number {
    this.#check(offset, 2);
    return this.#view.getUint16(offset, order === "le");
  }

  u32(offset: number, order: ByteOrder = "le"): number {
    this.#check(offset, 4);
    return this.#view.getUint32(offset, order === "le");
  }

  u64(offset: number, order: ByteOrder = "le"): bigint {
    this.#check(offset, 8);
    return this.#view.getBigUint64(offset, order === "le");
  }

  slice(offset: number, length: number): Uint8Array {
    this.#check(offset, length);
    return this.bytes.subarray(offset, offset + length);
  }

  copy(offset: number, length: number): Uint8Array {
    this.#check(offset, length);
    return this.bytes.slice(offset, offset + length);
  }
}

export function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) total += part.byteLength;
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

export function firstDifference(
  left: Uint8Array,
  right: Uint8Array,
): number | null {
  const shared = Math.min(left.byteLength, right.byteLength);
  for (let i = 0; i < shared; i++) {
    if (left[i] !== right[i]) return i;
  }
  return left.byteLength === right.byteLength ? null : shared;
}
