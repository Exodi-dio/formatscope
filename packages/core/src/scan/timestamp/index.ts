export interface Hypothesis {
  readonly kind: "timestamp";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const TIMESTAMP_PRIOR = 0.60;

// Unix timestamps between 2000 and 2038 (reasonable range for file formats)
const TS_MIN = 946684800; // 2000-01-01
const TS_MAX = 2147483647; // 2038-01-19

export function scanTimestamps(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  // u32 LE timestamps at 4-byte boundaries
  for (let offset = 0; offset + 4 <= bytes.byteLength; offset += 4) {
    const value =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24);

    if (value >= TS_MIN && value <= TS_MAX) {
      hypotheses.push({
        kind: "timestamp",
        offset,
        length: 4,
        confidence: TIMESTAMP_PRIOR,
        evidence: [`unix timestamp ${value} at offset ${offset}`],
      });
    }
  }

  return hypotheses;
}
