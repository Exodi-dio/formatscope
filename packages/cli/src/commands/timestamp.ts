import { readFile } from "node:fs/promises";
import { scanTimestamps } from "@formatscope/core";

export async function timestamp(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope timestamp <file>");
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

  const results = scanTimestamps(bytes);

  console.log(`File: ${filePath}`);
  console.log(`Timestamps: ${results.length}`);
  console.log("");

  for (const t of results) {
    console.log(`  ${t.evidence.join(", ")} conf=${t.confidence.toFixed(2)}`);
  }

  return 0;
}
