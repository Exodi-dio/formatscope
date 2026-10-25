export interface ChecksumCandidate {
  readonly offset: number;
  readonly length: number;
  readonly checksumOffset: number;
}

export function scanChecksum(bytes: Uint8Array): ScoredHypothesis[] {
  const hypotheses: ScoredHypothesis[] = [];

  for (let regionEnd = 4; regionEnd <= bytes.byteLength; regionEnd++) {
    const checksumOffset = regionEnd - 4;
    const storedCRC =
      bytes[checksumOffset]! |
      (bytes[checksumOffset + 1]! << 8) |
      (bytes[checksumOffset + 2]! << 16) |
      (bytes[checksumOffset + 3]! << 24);

    const computedCRC = crc32(bytes.subarray(0, checksumOffset));

    if (storedCRC === computedCRC && checksumOffset > 0) {
      hypotheses.push({
        offset: 0,
        length: regionEnd,
        confidence: 0.98,
        score: 0.98 * regionEnd,
      });
    }
  }

  for (let regionEnd = 4; regionEnd <= bytes.byteLength; regionEnd++) {
    const checksumOffset = regionEnd - 4;
    const storedAdler =
      bytes[checksumOffset]! |
      (bytes[checksumOffset + 1]! << 8) |
      (bytes[checksumOffset + 2]! << 16) |
      (bytes[checksumOffset + 3]! << 24);

    const computedAdler = adler32(bytes.subarray(0, checksumOffset));

    if (storedAdler === computedAdler && checksumOffset > 0) {
      hypotheses.push({
        offset: 0,
        length: regionEnd,
        confidence: 0.97,
        score: 0.97 * regionEnd,
      });
    }
  }

  return hypotheses;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.byteLength; i++) {
    crc ^= data[i]!;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;

  for (let i = 0; i < data.byteLength; i++) {
    a = (a + data[i]!) % MOD;
    b = (b + a) % MOD;
  }

  return (b << 16) | a;
}

import type { ScoredHypothesis } from "../../infer/resolver";
