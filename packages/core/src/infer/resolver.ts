export interface ScoredHypothesis {
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly score: number;
}

export interface FormatModel {
  readonly rootOffset: number;
  readonly rootLength: number;
  readonly hypotheses: readonly ScoredHypothesis[];
  readonly coverage: number;
}

function overlaps(a: ScoredHypothesis, b: ScoredHypothesis): boolean {
  return a.offset < b.offset + b.length && b.offset < a.offset + a.length;
}

export function resolve(
  hypotheses: readonly ScoredHypothesis[],
  fileLength: number,
): FormatModel {
  // Sort by score descending, then offset ascending (tie-break from D18)
  const sorted = [...hypotheses].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.offset - b.offset;
  });

  // Greedy: select non-overlapping hypotheses in score order
  const selected: ScoredHypothesis[] = [];

  for (const hyp of sorted) {
    if (hyp.offset + hyp.length > fileLength) continue;

    let hasOverlap = false;
    for (const sel of selected) {
      if (overlaps(hyp, sel)) {
        hasOverlap = true;
        break;
      }
    }
    if (hasOverlap) continue;

    selected.push(hyp);
  }

  // Sort selected by offset for stable output
  selected.sort((a, b) => a.offset - b.offset);

  // Compute coverage (fraction of file covered by non-opaque hypotheses)
  let covered = 0;
  for (const hyp of selected) covered += hyp.length;
  const coverage = fileLength > 0 ? covered / fileLength : 0;

  return {
    rootOffset: 0,
    rootLength: fileLength,
    hypotheses: selected,
    coverage,
  };
}

export function opaqueModel(fileLength: number): FormatModel {
  return {
    rootOffset: 0,
    rootLength: fileLength,
    hypotheses: [],
    coverage: 0,
  };
}
