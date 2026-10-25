import * as fs from "node:fs";
import { scanStrings } from "@formatscope/core";

export async function strings(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope strings <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = fs.readFileSync(filePath);
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const results = scanStrings(bytes);

  console.log(`File: ${filePath}`);
  console.log(`String runs: ${results.length}`);
  console.log("");

  for (const s of results) {
    console.log(`  0x${s.offset.toString(16).padStart(4, "0")} len=${s.length} conf=${s.confidence.toFixed(2)}`);
  }

  return 0;
}
