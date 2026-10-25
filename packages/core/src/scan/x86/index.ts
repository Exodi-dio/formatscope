export interface Hypothesis {
  readonly kind: "x86";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const X86_PRIOR = 0.75;

// Common x86 opcode prefixes and single-byte opcodes
const X86_OPCODES = new Set([
  0x90, // nop
  0xcc, // int3
  0xe8, // call rel32
  0xe9, // jmp rel32
  0xeb, // jmp rel8
  0x74, 0x75, 0x72, 0x73, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, // jcc short
  0x0f, // two-byte escape
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, // push reg
  0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f, // pop reg
  0x8b, 0x89, // mov
  0xb8, 0xb9, 0xba, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf, // mov reg, imm32
  0xc3, // ret
  0xc2, // ret imm16
]);

export function scanX86(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  let runStart = -1;
  let runLen = 0;

  for (let i = 0; i < bytes.byteLength; i++) {
    if (X86_OPCODES.has(bytes[i])) {
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
