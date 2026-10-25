export interface Hypothesis {
  readonly kind: "ip";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const IP_PRIOR = 0.70;

export function scanIPs(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  for (let offset = 0; offset + 4 <= bytes.byteLength; offset++) {
    const a = bytes[offset];
    const b = bytes[offset + 1];
    const c = bytes[offset + 2];
    const d = bytes[offset + 3];

    // Skip 0.0.0.0 and 255.255.255.255
    if (a === 0 && b === 0 && c === 0 && d === 0) continue;
    if (a === 255 && b === 255 && c === 255 && d === 255) continue;

    hypotheses.push({
      kind: "ip",
      offset,
      length: 4,
      confidence: IP_PRIOR,
      evidence: [`IP address ${a}.${b}.${c}.${d} at offset ${offset}`],
    });
  }

  return hypotheses;
}
