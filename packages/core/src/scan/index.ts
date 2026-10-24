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
