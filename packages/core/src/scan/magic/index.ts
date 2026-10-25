export interface Hypothesis {
  readonly kind: "magic" | "string" | "periodicity";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const MAGIC_PRIOR = 0.95;

const KNOWN_MAGICS: readonly {
  readonly name: string;
  readonly bytes: Uint8Array;
}[] = [
  { name: "FSBX", bytes: new Uint8Array([0x46, 0x53, 0x42, 0x58]) },
  { name: "FSRT", bytes: new Uint8Array([0x46, 0x53, 0x52, 0x54]) },
  { name: "FSTL", bytes: new Uint8Array([0x46, 0x53, 0x54, 0x4c]) },
  { name: "MZ", bytes: new Uint8Array([0x4d, 0x5a]) },
  { name: "PK", bytes: new Uint8Array([0x50, 0x4b]) },
  { name: "PE", bytes: new Uint8Array([0x50, 0x45, 0x00, 0x00]) },
  { name: "ELF", bytes: new Uint8Array([0x7f, 0x45, 0x4c, 0x46]) },
  { name: "ZIP", bytes: new Uint8Array([0x50, 0x4b, 0x03, 0x04]) },
  { name: "PDF", bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]) },
  { name: "PNG", bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
  { name: "JPEG", bytes: new Uint8Array([0xff, 0xd8, 0xff]) },
  { name: "GIF", bytes: new Uint8Array([0x47, 0x49, 0x46, 0x38]) },
  { name: "BMP", bytes: new Uint8Array([0x42, 0x4d]) },
  { name: "WAV", bytes: new Uint8Array([0x52, 0x49, 0x46, 0x46]) },
  { name: "MP3", bytes: new Uint8Array([0x49, 0x44, 0x33]) },
  { name: "SQLite", bytes: new Uint8Array([0x53, 0x51, 0x4c, 0x69, 0x74, 0x65]) },
];

export function scanMagic(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  for (const magic of KNOWN_MAGICS) {
    if (bytes.byteLength < magic.bytes.byteLength) continue;

    let match = true;
    for (let i = 0; i < magic.bytes.byteLength; i++) {
      if (bytes[i] !== magic.bytes[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      hypotheses.push({
        kind: "magic",
        offset: 0,
        length: magic.bytes.byteLength,
        confidence: MAGIC_PRIOR,
        evidence: [`magic "${magic.name}" at offset 0`],
      });
    }
  }

  return hypotheses;
}
