export interface Hypothesis {
  readonly kind: "periodicity";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const PERIODICITY_BASE_PRIOR = 0.70;
const PERIODICITY_STRIDE_BONUS = 0.05;
const PERIODICITY_MAX_PRIOR = 0.95;
const MIN_MATCH_RATIO = 0.8;
const MAX_STRIDE = 32;

export function scanPeriodicity(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];
  const maxStride = Math.min(MAX_STRIDE, Math.floor(bytes.byteLength / 2));

  for (let stride = 1; stride <= maxStride; stride += 1) {
    let matches = 0;
    let total = 0;

    for (let i = 0; i < bytes.byteLength - stride; i += 1) {
      total += 1;
      if (bytes[i]! === bytes[i + stride]!) {
        matches += 1;
      }
    }

    if (total === 0) continue;

    const ratio = matches / total;
    if (ratio < MIN_MATCH_RATIO) continue;

    const prior = Math.min(
      PERIODICITY_MAX_PRIOR,
      PERIODICITY_BASE_PRIOR + PERIODICITY_STRIDE_BONUS * stride,
    );

    hypotheses.push({
      kind: "periodicity",
      offset: 0,
      length: bytes.byteLength,
      confidence: prior * ratio,
      evidence: [
        `stride ${stride}: ${matches}/${total} positions match (${Math.round(
          ratio * 100,
        )}%)`,
      ],
    });
  }

  return hypotheses;
}
