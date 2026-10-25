export interface Hypothesis {
  readonly kind: "x86";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const X86_PRIOR = 0.75;

const X86_OPCODES = new Set([
  0x90, 0xcc, 0xe8, 0xe9, 0xeb,
  0x74, 0x75, 0x72, 0x73, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
  0x0f,
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57,
  0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f,
  0x8b, 0x89,
  0xb8, 0xb9, 0xba, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf,
  0xc3, 0xc2,
]);

export function scanX86(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  let runStart = -1;
  let runLen = 0;

  for (let i = 0; i < bytes.byteLength; i++) {
    if (X86_OPCODES.has(bytes[i]!)) {
      if (runStart === -1) runStart = i;
      runLen++;
    } else {
      if (runLen >= 4) {
        hypotheses.push({
          kind: "x86",
          offset: runStart,
          length: runLen,
          confidence: X86_PRIOR,
          evidence: [`x86 opcode run of ${runLen} bytes at offset ${runStart}`],
        });
      }
      runStart = -1;
      runLen = 0;
    }
  }

  if (runLen >= 4) {
    hypotheses.push({
      kind: "x86",
      offset: runStart,
      length: runLen,
      confidence: X86_PRIOR,
      evidence: [`x86 opcode run of ${runLen} bytes at offset ${runStart}`],
    });
  }

  return hypotheses;
}
