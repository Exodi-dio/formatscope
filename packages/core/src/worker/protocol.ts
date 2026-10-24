import type { EntropyRegion } from "../scan/entropy/index";

export type AnalyzeRequest = {
  readonly type: "analyze";
  readonly bytes: Uint8Array;
};

export type CancelRequest = {
  readonly type: "cancel";
};

export type Request = AnalyzeRequest | CancelRequest;

export type Progress = {
  readonly type: "progress";
  readonly phase: string;
  readonly pct: number;
};

export type EntropyResponse = {
  readonly type: "entropy";
  readonly regions: readonly EntropyRegion[];
};

export type ErrorResponse = {
  readonly type: "error";
  readonly message: string;
};

export type Response = Progress | EntropyResponse | ErrorResponse;
