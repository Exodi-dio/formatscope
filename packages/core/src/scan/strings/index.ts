export interface Hypothesis {
  readonly kind: "string";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const STRING_PRIOR = 0.60;
const MIN_STRING_LENGTH = 4;

function isPrintable(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

export function scanStrings(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];
  let start = -1;

  for (let i = 0; i < bytes.byteLength; i++) {
    if (isPrintable(bytes[i])) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      const length = i - start;
      if (length >= MIN_STRING_LENGTH) {
        hypotheses.push({
          kind: "string",
          offset: start,
          length,
          confidence: STRING_PRIOR,
          evidence: [`printable run of ${length} bytes at offset ${start}`],
        });
      }
      start = -1;
    }
  }

  if (start !== -1 && bytes.byteLength - start >= MIN_STRING_LENGTH) {
    hypotheses.push({
      kind: "string",
      offset: start,
      length: bytes.byteLength - start,
      confidence: STRING_PRIOR,
      evidence: [`printable run of ${bytes.byteLength - start} bytes at offset ${start}`],
    });
  }

  return hypotheses;
}
