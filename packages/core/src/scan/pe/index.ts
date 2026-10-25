export interface Hypothesis {
  readonly kind: "pe";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const PE_PRIOR = 0.95;

export function scanPE(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  // MZ header at offset 0
  if (bytes.byteLength < 64) return hypotheses;
  if (bytes[0] !== 0x4d || bytes[1] !== 0x5a) return hypotheses;

  // PE signature at e_lfanew offset
  const e_lfanew =
    bytes[0x3c] |
    (bytes[0x3d] << 8) |
    (bytes[0x3e] << 16) |
    (bytes[0x3f] << 24);

  if (e_lfanew + 24 > bytes.byteLength) {
    hypotheses.push({
      kind: "pe",
      offset: 0,
      length: Math.min(bytes.byteLength, 64),
      confidence: 0.70,
      evidence: ["MZ header at offset 0, PE signature offset out of range"],
    });
    return hypotheses;
  }

  const peSig =
    bytes[e_lfanew] |
    (bytes[e_lfanew + 1] << 8) |
    (bytes[e_lfanew + 2] << 16) |
    (bytes[e_lfanew + 3] << 24);

  if (peSig !== 0x00004550) {
    hypotheses.push({
      kind: "pe",
      offset: 0,
      length: Math.min(bytes.byteLength, 64),
      confidence: 0.60,
      evidence: ["MZ header at offset 0, invalid PE signature"],
    });
    return hypotheses;
  }

  // COFF header at e_lfanew + 4
  const coffOffset = e_lfanew + 4;
  if (coffOffset + 20 > bytes.byteLength) {
    hypotheses.push({
      kind: "pe",
      offset: 0,
      length: Math.min(bytes.byteLength, e_lfanew + 4),
      confidence: 0.80,
      evidence: ["PE signature valid, COFF header truncated"],
    });
    return hypotheses;
  }

  const machine =
    bytes[coffOffset] |
    (bytes[coffOffset + 1] << 8);
  const numSections =
    bytes[coffOffset + 2] |
    (bytes[coffOffset + 3] << 8);

  const machineNames: Record<number, string> = {
    0x014c: "i386",
    0x0162: "mips r3000",
    0x0166: "mips little endian",
    0x0168: "mips alpha",
    0x0169: "mips r4000",
    0x0184: "alpha axp",
    0x01a2: "hitachi sh3",
    0x01a3: "hitachi sh3dsp",
    0x01a6: "hitachi sh4",
    0x01a8: "hitachi sh5",
    0x01c0: "mips little endian (wce v2)",
    0x01c6: "alpha axp 64",
    0x01c8: "mips little endian",
    0x01f0: "powerpc little endian",
    0x01f1: "powerpc with floating point",
    0x01fa: "ia64",
    0x0266: "mips little endian",
    0x0284: "alpha axp 64",
    0x0366: "mips little endian",
    0x0466: "mips little endian",
    0x0520: "ibm s390",
    0x0cef: "clr pure il",
    0x0eec: "bytecode",
    0x8664: "amd64",
    0x9041: "mitsubishi m32r",
    0xaa64: "arm64",
    0x0c0: "arm thumb",
    0x0d3: "arm thumb2",
  };

  const machineName = machineNames[machine] || `0x${machine.toString(16)}`;

  hypotheses.push({
    kind: "pe",
    offset: 0,
    length: Math.min(bytes.byteLength, e_lfanew + 24 + numSections * 40),
    confidence: PE_PRIOR,
    evidence: [
      `PE32+ executable, machine=${machineName}, sections=${numSections}`,
    ],
  });

  return hypotheses;
}
