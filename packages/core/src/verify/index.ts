import { firstDifference } from "../bytes/index";
import { decode, encode } from "../interp/index";
import type { Schema } from "../schema/index";

export interface VerifyResult {
  readonly ok: boolean;
  readonly firstDiffOffset: number | null;
  readonly inputLength: number;
  readonly outputLength: number;
}

export function verifyRoundTrip(
  schema: Schema,
  input: Uint8Array,
): VerifyResult {
  const output = encode(decode(schema, input));
  return compare(input, output);
}

export function verifyBytes(
  expected: Uint8Array,
  actual: Uint8Array,
): VerifyResult {
  return compare(expected, actual);
}

function compare(input: Uint8Array, output: Uint8Array): VerifyResult {
  const firstDiffOffset = firstDifference(input, output);

  return {
    ok: firstDiffOffset === null,
    firstDiffOffset,
    inputLength: input.byteLength,
    outputLength: output.byteLength,
  };
}
