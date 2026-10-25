export type { Hypothesis } from "./magic/index";
export { scanMagic } from "./magic/index";

export type { Hypothesis as StringHypothesis } from "./strings/index";
export { scanStrings } from "./strings/index";

export type { Hypothesis as PeriodicityHypothesis } from "./periodicity/index";
export { scanPeriodicity } from "./periodicity/index";

export type { LengthPrefixCandidate } from "./length-prefix/index";
export { scanLengthPrefix } from "./length-prefix/index";

export type { ChecksumCandidate } from "./checksum/index";
export { scanChecksum } from "./checksum/index";

export type { Hypothesis as X86Hypothesis } from "./x86/index";
export { scanX86 } from "./x86/index";

export type { Hypothesis as UUIDHypothesis } from "./uuid/index";
export { scanUUID } from "./uuid/index";

export type { Hypothesis as TimestampHypothesis } from "./timestamp/index";
export { scanTimestamps } from "./timestamp/index";

export type { Hypothesis as IPHypothesis } from "./ip/index";
export { scanIPs } from "./ip/index";

export type { Hypothesis as PEHypothesis } from "./pe/index";
export { scanPE } from "./pe/index";

export type { Hypothesis as ELFHypothesis } from "./elf/index";
export { scanELF } from "./elf/index";
