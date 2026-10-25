import { readFile } from "node:fs/promises";
import {
  scanMagic,
  scanStrings,
  scanPeriodicity,
  scanLengthPrefix,
  scanChecksum,
  scanX86,
  scanUUID,
  scanTimestamps,
  scanIPs,
  scanPE,
  scanELF,
  resolve,
  opaqueSchema,
  type Schema,
} from "@formatscope/core";

export async function infer(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope infer <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = Uint8Array.from(await readFile(filePath));
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const magic = scanMagic(bytes);
  const strings = scanStrings(bytes);
  const periodicity = scanPeriodicity(bytes);
  const lengthPrefix = scanLengthPrefix(bytes);
  const checksum = scanChecksum(bytes);
  const x86 = scanX86(bytes);
  const uuids = scanUUID(bytes);
  const timestamps = scanTimestamps(bytes);
  const ips = scanIPs(bytes);
  const pe = scanPE(bytes);
  const elf = scanELF(bytes);

  const allHypotheses = [
    ...magic.map(h => ({ ...h, score: h.confidence * h.length })),
    ...strings.map(h => ({ ...h, score: h.confidence * h.length })),
    ...periodicity.map(h => ({ ...h, score: h.confidence * h.length })),
    ...lengthPrefix,
    ...checksum,
    ...x86.map(h => ({ ...h, score: h.confidence * h.length })),
    ...uuids.map(h => ({ ...h, score: h.confidence * h.length })),
    ...timestamps.map(h => ({ ...h, score: h.confidence * h.length })),
    ...ips.map(h => ({ ...h, score: h.confidence * h.length })),
    ...pe.map(h => ({ ...h, score: h.confidence * h.length })),
    ...elf.map(h => ({ ...h, score: h.confidence * h.length })),
  ];

  const model = resolve(allHypotheses, bytes.byteLength);

  console.log(`File: ${filePath}`);
  console.log(`Size: ${bytes.byteLength} bytes`);
  console.log(`Coverage: ${Math.round(model.coverage * 100)}%`);
  console.log(`Hypotheses: ${model.hypotheses.length}`);
  console.log("");

  for (const h of model.hypotheses) {
    console.log(
      `  0x${h.offset.toString(16).padStart(4, "0")} ` +
      `len=${h.length.toString().padStart(4)} ` +
      `conf=${h.confidence.toFixed(2)} ` +
      `score=${h.score.toFixed(1)}`,
    );
  }

  const schema: Schema = {
    version: 1,
    byteLength: bytes.byteLength,
    root: {
      kind: "opaque",
      offset: 0,
      length: bytes.byteLength,
      confidence: 0,
      evidence: ["whole file treated as opaque"],
    },
  };

  console.log("");
  console.log("Inferred schema:");
  console.log(JSON.stringify(schema, null, 2));

  return 0;
}
