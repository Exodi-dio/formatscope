export interface Hypothesis {
  readonly kind: "elf";
  readonly offset: number;
  readonly length: number;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

const ELF_PRIOR = 0.95;

export function scanELF(bytes: Uint8Array): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  if (bytes.byteLength < 64) return hypotheses;

  if (
    bytes[0] !== 0x7f ||
    bytes[1] !== 0x45 ||
    bytes[2] !== 0x4c ||
    bytes[3] !== 0x46
  ) {
    return hypotheses;
  }

  const eiClass = bytes[4]!;
  const eiData = bytes[5]!;
  const eiVersion = bytes[6]!;
  const eiOSABI = bytes[7]!;

  if (eiVersion !== 1) {
    hypotheses.push({
      kind: "elf",
      offset: 0,
      length: Math.min(bytes.byteLength, 64),
      confidence: 0.60,
      evidence: ["ELF header with invalid version"],
    });
    return hypotheses;
  }

  const className = eiClass === 1 ? "32-bit" : eiClass === 2 ? "64-bit" : `unknown(${eiClass})`;
  const dataName = eiData === 1 ? "little-endian" : eiData === 2 ? "big-endian" : `unknown(${eiData})`;
  const osName = eiOSABI === 0 ? "System V" : eiOSABI === 1 ? "HP-UX" : eiOSABI === 2 ? "NetBSD" : eiOSABI === 3 ? "Linux" : `unknown(${eiOSABI})`;

  const eTypeOffset = 16;
  const eType =
    bytes[eTypeOffset]! |
    (bytes[eTypeOffset + 1]! << 8);

  const typeNames: Record<number, string> = {
    0: "none",
    1: "relocatable",
    2: "executable",
    3: "shared object",
    4: "core",
  };
  const typeName = typeNames[eType] || `0x${eType.toString(16)}`;

  const eMachineOffset = 18;
  const eMachine =
    bytes[eMachineOffset]! |
    (bytes[eMachineOffset + 1]! << 8);

  const machineNames: Record<number, string> = {
    0: "none",
    3: "i386",
    18: "x86_64",
    62: "arm",
    243: "riscv",
  };
  const machineName = machineNames[eMachine] || `0x${eMachine.toString(16)}`;

  hypotheses.push({
    kind: "elf",
    offset: 0,
    length: Math.min(bytes.byteLength, 64),
    confidence: ELF_PRIOR,
    evidence: [
      `ELF ${className} ${dataName}, ${osName}, type=${typeName}, machine=${machineName}`,
    ],
  });

  return hypotheses;
}
