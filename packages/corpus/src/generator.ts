export type FormatFile = {
  readonly name: string;
  readonly bytes: Uint8Array;
};

export function generateFSBX(seed: number, version: 1 | 2): FormatFile {
  const rng = new PRNG(seed);
  const chunks = 4;
  const parts: Uint8Array[] = [];

  // Header: "FSBX" + version + numChunks
  parts.push(new Uint8Array([0x46, 0x53, 0x42, 0x58, version]));
  parts.push(u32LE(chunks));

  for (let c = 0; c < chunks; c += 1) {
    const tag = rng.bytes(4);
    const length = rng.next() % 64 + 4;
    const payload = rng.bytes(length);
    parts.push(tag);
    parts.push(u32LE(length));
    parts.push(payload);

    if (version === 2) {
      parts.push(u32LE(crc32(payload)));
    }
  }

  return { name: `fsbx-v${version}`, bytes: concatBytes(parts) };
}

export function generateFSRT(seed: number, version: 1 | 2): FormatFile {
  const rng = new PRNG(seed);
  const recordSize = version === 1 ? 8 : 12;
  const records = 16;
  const parts: Uint8Array[] = [];

  // Header: "FSRT" + version + recordSize + numRecords
  parts.push(new Uint8Array([0x46, 0x53, 0x52, 0x54, version, recordSize]));
  parts.push(u32LE(records));

  const recordBytes: Uint8Array[] = [];
  for (let r = 0; r < records; r += 1) {
    recordBytes.push(rng.bytes(recordSize));
  }
  for (const record of recordBytes) {
    parts.push(record);
  }

  // Trailing CRC32 over all records
  const allRecords = concatBytes(recordBytes);
  parts.push(u32LE(crc32(allRecords)));

  return { name: `fsrt-v${version}`, bytes: concatBytes(parts) };
}

export function generateFSTL(seed: number, version: 1 | 2): FormatFile {
  const rng = new PRNG(seed);
  const entries = 8;
  const strings = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const parts: Uint8Array[] = [];

  if (version === 1) {
    parts.push(new Uint8Array([0x46, 0x53, 0x54, 0x4c, 1]));
  } else {
    parts.push(new Uint8Array([0x46, 0x53, 0x54, 0x4c, 2]));
    parts.push(u32LE(entries));
  }

  // Entries
  for (let e = 0; e < entries; e += 1) {
    const type = rng.next() % 4 + 1;
    const stringRef = rng.next() % strings.length;
    const valueLen = rng.next() % 8 + 1;
    const value = rng.bytes(valueLen);

    if (version === 1) {
      parts.push(new Uint8Array([type]));
      parts.push(u32LE(valueLen));
      parts.push(value);
    } else {
      parts.push(new Uint8Array([type, stringRef]));
      parts.push(u32LE(valueLen));
      parts.push(value);
    }
  }

  // String table
  for (const str of strings) {
    const strBytes = new TextEncoder().encode(str);
    parts.push(u32LE(strBytes.byteLength));
    parts.push(strBytes);
  }

  return { name: `fstl-v${version}`, bytes: concatBytes(parts) };
}

export function generateAll(seed: number): FormatFile[] {
  return [
    generateFSBX(seed, 1),
    generateFSBX(seed, 2),
    generateFSRT(seed, 1),
    generateFSRT(seed, 2),
    generateFSTL(seed, 1),
    generateFSTL(seed, 2),
  ];
}

// --- PRNG ---

class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0;
    return this.state >>> 24;
  }

  bytes(length: number): Uint8Array {
    const out = new Uint8Array(length);

    for (let i = 0; i < length; i += 1) {
      out[i] = this.next();
    }

    return out;
  }
}

// --- Helpers ---

function u32LE(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = value & 0xff;
  out[1] = (value >>> 8) & 0xff;
  out[2] = (value >>> 16) & 0xff;
  out[3] = (value >>> 24) & 0xff;
  return out;
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

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.byteLength; i += 1) {
    crc ^= data[i];
    for (let j = 0; j < 8; j += 1) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
