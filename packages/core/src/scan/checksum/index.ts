export interface ChecksumCandidate {
  readonly offset: number;
  readonly length: number;
  readonly checksumOffset: number;
}

export function scanChecksum(bytes: Uint8Array): ScoredHypothesis[] {
  const hypotheses: ScoredHypothesis[] = [];

  // Check for CRC32 at the end of the file
  // Scan for regions where the last 4 bytes are a CRC32 of the preceding bytes
  for (let regionEnd = 4; regionEnd <= bytes.byteLength; regionEnd += 1) {
    const checksumOffset = regionEnd - 4;
    const storedCRC =
      bytes[checksumOffset]! |
      (bytes[checksumOffset + 1]! << 8) |
      (bytes[checksumOffset + 2]! << 16) |
      (bytes[checksumOffset + 3]! << 24);

    const computedCRC = crc32(bytes.subarray(0, checksumOffset));

    if (storedCRC === computedCRC && checksumOffset > 0) {
      const confidence = 0.98; // D18: verified checksum promotes to 0.98
      const score = confidence * regionEnd;

      hypotheses.push({
        offset: 0,
        length: regionEnd,
        confidence,
        score,
      });
    }
  }

  return hypotheses;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.byteLength; i += 1) {
    crc ^= data[i]!;
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

import type { ScoredHypothesis } from "../infer/resolver";
