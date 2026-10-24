import { describe, expect, it } from "vitest";

import { resolve, opaqueModel, type ScoredHypothesis } from "../src/infer/resolver";

function hyp(offset: number, length: number, confidence: number): ScoredHypothesis {
  return { offset, length, confidence, score: confidence * length };
}

describe("resolve", () => {
  it("returns opaque model for empty hypotheses", () => {
    const model = resolve([], 100);

    expect(model.hypotheses).toEqual([]);
    expect(model.coverage).toBe(0);
    expect(model.rootLength).toBe(100);
  });

  it("selects a single non-overlapping hypothesis", () => {
    const model = resolve([hyp(0, 16, 0.9)], 100);

    expect(model.hypotheses).toHaveLength(1);
    expect(model.hypotheses[0]).toEqual({ offset: 0, length: 16, confidence: 0.9, score: 14.4 });
    expect(model.coverage).toBe(0.16);
  });

  it("rejects hypothesis that extends past file end", () => {
    const model = resolve([hyp(90, 20, 0.9)], 100);

    expect(model.hypotheses).toEqual([]);
    expect(model.coverage).toBe(0);
  });

  it("greedy selection prefers higher score", () => {
    // Two overlapping hypotheses: shorter but higher score wins
    const model = resolve([
      hyp(0, 8, 0.95),   // score 7.6
      hyp(0, 16, 0.5),   // score 8.0 — higher score, selected
    ], 100);

    expect(model.hypotheses).toHaveLength(1);
    expect(model.hypotheses[0].length).toBe(16);
  });

  it("selects non-overlapping hypotheses in order", () => {
    const model = resolve([
      hyp(0, 10, 0.9),   // score 9.0, selected first
      hyp(10, 10, 0.8),  // score 8.0, selected (no overlap)
      hyp(5, 10, 0.95),  // score 9.5, overlaps with first, skipped
    ], 100);

    expect(model.hypotheses).toHaveLength(2);
    expect(model.hypotheses[0].offset).toBe(0);
    expect(model.hypotheses[1].offset).toBe(10);
    expect(model.coverage).toBe(0.2);
  });

  it("sorts selected hypotheses by offset", () => {
    const model = resolve([
      hyp(50, 10, 0.9),
      hyp(0, 10, 0.8),
    ], 100);

    expect(model.hypotheses[0].offset).toBe(0);
    expect(model.hypotheses[1].offset).toBe(50);
  });
});

describe("opaqueModel", () => {
  it("creates a model with no hypotheses and zero coverage", () => {
    const model = opaqueModel(256);

    expect(model.hypotheses).toEqual([]);
    expect(model.coverage).toBe(0);
    expect(model.rootLength).toBe(256);
  });
});
