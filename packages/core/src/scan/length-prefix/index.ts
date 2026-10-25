export interface LengthPrefixCandidate {
  readonly offset: number;
  readonly lengthValue: number;
  readonly targetOffset: number;
}

export function scanLengthPrefix(bytes: Uint8Array): ScoredHypothesis[] {
  const hypotheses: ScoredHypothesis[] = [];

  // u32 LE length prefix at 4-byte boundaries
  for (let offset = 0; offset + 4 <= bytes.byteLength; offset += 4) {
    const lengthValue =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24);

    if (lengthValue < 4 || lengthValue % 4 !== 0) continue;
    const targetOffset = offset + 4 + lengthValue;
    if (targetOffset > bytes.byteLength) continue;
    if (targetOffset % 4 !== 0) continue;

    const confidence = Math.min(0.85, 0.5 + (lengthValue / 1000) * 0.35);
    const score = confidence * (4 + lengthValue);

    hypotheses.push({
      offset,
      length: 4 + lengthValue,
      confidence,
      score,
    });
  }

  // u16 LE length prefix at 2-byte boundaries
  for (let offset = 0; offset + 2 <= bytes.byteLength; offset += 2) {
    const lengthValue = bytes[offset] | (bytes[offset + 1] << 8);

    if (lengthValue < 2) continue;
    const targetOffset = offset + 2 + lengthValue;
    if (targetOffset > bytes.byteLength) continue;

    const confidence = Math.min(0.80, 0.45 + (lengthValue / 500) * 0.35);
    const score = confidence * (2 + lengthValue);

    hypotheses.push({
      offset,
      length: 2 + lengthValue,
      confidence,
      score,
    });
  }

  return hypotheses;
}

import type { ScoredHypothesis } from "../../infer/resolver";
