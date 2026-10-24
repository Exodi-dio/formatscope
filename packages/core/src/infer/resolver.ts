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

export function resolve(
  hypotheses: readonly ScoredHypothesis[],
  fileLength: number,
): FormatModel {
  // Sort by score descending, then offset ascending (tie-break from D18)
  const sorted = [...hypotheses].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.offset - b.offset;
  });

  // Greedy interval scheduling: select non-overlapping hypotheses
  const selected: ScoredHypothesis[] = [];
  let cursor = 0;

  for (const hyp of sorted) {
    if (hyp.offset < cursor) continue; // overlaps with already selected
    if (hyp.offset + hyp.length > fileLength) continue; // extends past file

    selected.push(hyp);
    cursor = hyp.offset + hyp.length;
  }

  // Sort selected by offset for output
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
