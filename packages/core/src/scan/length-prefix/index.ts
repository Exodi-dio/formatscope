export interface LengthPrefixCandidate {
  readonly offset: number;
  readonly lengthValue: number;
  readonly targetOffset: number;
}

export function scanLengthPrefix(bytes: Uint8Array): ScoredHypothesis[] {
  const hypotheses: ScoredHypothesis[] = [];

  // Scan for u32 LE at 4-byte boundaries
  for (let offset = 0; offset + 4 <= bytes.byteLength; offset += 4) {
    const lengthValue =
      bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24);

    // Length must point to a 4-byte boundary within the file
    if (lengthValue < 4 || lengthValue % 4 !== 0) continue;
    const targetOffset = offset + 4 + lengthValue;
    if (targetOffset > bytes.byteLength) continue;
    if (targetOffset % 4 !== 0) continue;

    // Confidence: higher for larger, more specific lengths
    const confidence = Math.min(0.85, 0.5 + (lengthValue / 1000) * 0.35);
    const score = confidence * (4 + lengthValue);

    hypotheses.push({
      offset,
      length: 4 + lengthValue,
      confidence,
      score,
    });
  }

  return hypotheses;
}

import type { ScoredHypothesis } from "../infer/resolver";
