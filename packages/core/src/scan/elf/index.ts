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

  // ELF magic: 0x7f 'E' 'L' 'F'
  if (
    bytes[0] !== 0x7f ||
    bytes[1] !== 0x45 ||
    bytes[2] !== 0x4c ||
    bytes[3] !== 0x46
  ) {
    return hypotheses;
  }

  const eiClass = bytes[4]; // 1 = 32-bit, 2 = 64-bit
  const eiData = bytes[5];  // 1 = LE, 2 = BE
  const eiVersion = bytes[6];
  const eiOSABI = bytes[7];

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

  // e_type at offset 16 (2 bytes)
  const eTypeOffset = eiClass === 1 ? 16 : 16;
  const eType =
    bytes[eTypeOffset] |
    (bytes[eTypeOffset + 1] << 8);

  const typeNames: Record<number, string> = {
    0: "none",
    1: "relocatable",
    2: "executable",
    3: "shared object",
    4: "core",
  };
  const typeName = typeNames[eType] || `0x${eType.toString(16)}`;

  // e_machine at offset 18 (2 bytes)
  const eMachineOffset = 18;
  const eMachine =
    bytes[eMachineOffset] |
    (bytes[eMachineOffset + 1] << 8);

  const machineNames: Record<number, string> = {
    0: "none",
    1: "m32r",
    2: "sparc",
    3: "i386",
    4: "m68k",
    5: "m88k",
    6: "i860",
    7: "mips",
    8: "ibm s390",
    9: "mips",
    10: "mips",
    11: "mips",
    12: "arm",
    13: "x86_64",
    14: "ia64",
    15: "mips",
    16: "powerpc",
    17: "powerpc64",
    18: "s390x",
    19: "ia64",
    20: "x86_64",
    21: "s390",
    22: "cr16",
    23: "old powerpc",
    24: "sparcv9",
    25: "h8/300",
    26: "ia64",
    27: "x86_64",
    28: "s390x",
    29: "blackfin",
    30: "ricoh r30c",
    31: "scarecrow",
    33: "alpha",
    36: "renesas r8c",
    37: "renesas m16c",
    38: "renesas m32c",
    40: "dspic",
    41: "freescale fpga",
    43: "coldfire",
    46: "freescale hc12",
    47: "nios ii",
    48: "moxie",
    50: "parisc",
    51: "freescale hc11",
    52: "sunplus spg",
    55: "ia64",
    60: "d10v",
    61: "d30v",
    62: "v850",
    63: "xstormy16",
    64: "op500",
    65: "rf",
    66: "whiteit",
    70: "ti c6000",
    71: "ti c6000",
    72: "ti c6000",
    73: "ti c6000",
    74: "ti c6000",
    75: "ti c6000",
    80: "ti c6000",
    81: "ti c6000",
    82: "ti c6000",
    83: "ti c6000",
    84: "ti c6000",
    85: "ti c6000",
    86: "ti c6000",
    87: "ti c6000",
    88: "ti c6000",
    89: "ti c6000",
    90: "ti c6000",
    91: "ti c6000",
    92: "ti c6000",
    93: "ti c6000",
    94: "ti c6000",
    95: "ti c6000",
    96: "ti c6000",
    97: "ti c6000",
    98: "ti c6000",
    99: "ti c6000",
    100: "ti c6000",
    101: "ti c6000",
    102: "ti c6000",
    103: "ti c6000",
    104: "ti c6000",
    105: "ti c6000",
    106: "ti c6000",
    107: "ti c6000",
    108: "ti c6000",
    109: "ti c6000",
    110: "ti c6000",
    111: "ti c6000",
    112: "ti c6000",
    113: "ti c6000",
    114: "ti c6000",
    115: "ti c6000",
    116: "ti c6000",
    117: "ti c6000",
    118: "ti c6000",
    119: "ti c6000",
    120: "ti c6000",
    121: "ti c6000",
    122: "ti c6000",
    123: "ti c6000",
    124: "ti c6000",
    125: "ti c6000",
    126: "ti c6000",
    127: "ti c6000",
    128: "ti c6000",
    129: "ti c6000",
    130: "ti c6000",
    131: "ti c6000",
    132: "ti c6000",
    133: "ti c6000",
    134: "ti c6000",
    135: "ti c6000",
    136: "ti c6000",
    137: "ti c6000",
    138: "ti c6000",
    139: "ti c6000",
    140: "ti c6000",
    141: "ti c6000",
    142: "ti c6000",
    143: "ti c6000",
    144: "ti c6000",
    145: "ti c6000",
    146: "ti c6000",
    147: "ti c6000",
    148: "ti c6000",
    149: "ti c6000",
    150: "ti c6000",
    151: "ti c6000",
    152: "ti c6000",
    153: "ti c6000",
    154: "ti c6000",
    155: "ti c6000",
    156: "ti c6000",
    157: "ti c6000",
    158: "ti c6000",
    159: "ti c6000",
    160: "ti c6000",
    161: "ti c6000",
    162: "ti c6000",
    163: "ti c6000",
    164: "ti c6000",
    165: "ti c6000",
    166: "ti c6000",
    167: "ti c6000",
    168: "ti c6000",
    169: "ti c6000",
    170: "ti c6000",
    171: "ti c6000",
    172: "ti c6000",
    173: "ti c6000",
    174: "ti c6000",
    175: "ti c6000",
    176: "ti c6000",
    177: "ti c6000",
    178: "ti c6000",
    179: "ti c6000",
    180: "ti c6000",
    181: "ti c6000",
    182: "ti c6000",
    183: "ti c6000",
    184: "ti c6000",
    185: "ti c6000",
    186: "ti c6000",
    187: "ti c6000",
    188: "ti c6000",
    189: "ti c6000",
    190: "ti c6000",
    191: "ti c6000",
    192: "ti c6000",
    193: "ti c6000",
    194: "ti c6000",
    195: "ti c6000",
    196: "ti c6000",
    197: "ti c6000",
    198: "ti c6000",
    199: "ti c6000",
    200: "ti c6000",
    201: "ti c6000",
    202: "ti c6000",
    203: "ti c6000",
    204: "ti c6000",
    205: "ti c6000",
    206: "ti c6000",
    207: "ti c6000",
    208: "ti c6000",
    209: "ti c6000",
    210: "ti c6000",
    211: "ti c6000",
    212: "ti c6000",
    213: "ti c6000",
    214: "ti c6000",
    215: "ti c6000",
    216: "ti c6000",
    217: "ti c6000",
    218: "ti c6000",
    219: "ti c6000",
    220: "ti c6000",
    221: "ti c6000",
    222: "ti c6000",
    223: "ti c6000",
    224: "ti c6000",
    225: "ti c6000",
    226: "ti c6000",
    227: "ti c6000",
    228: "ti c6000",
    229: "ti c6000",
    230: "ti c6000",
    213: "ti c6000",
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
