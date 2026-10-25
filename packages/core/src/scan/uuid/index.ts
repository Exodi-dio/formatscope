export interface Hypothesis {
  readonly kind: "uuid";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const UUID_PRIOR = 0.90;

// UUID pattern: 8-4-4-4-12 hex digits with dashes
const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

export function scanUUID(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];
  const text = new TextDecoder().decode(bytes);

  let match;
  const regex = new RegExp(UUID_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    hypotheses.push({
      kind: "uuid",
      offset: match.index,
      length: match[0].length,
      confidence: UUID_PRIOR,
      evidence: [`UUID/GUID at offset ${match.index}`],
    });
  }

  return hypotheses;
}
