import { readFile } from "node:fs/promises";
import { scanUUID } from "@formatscope/core";

export async function uuid(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope uuid <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = Buffer.from(await readFile(filePath));
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const results = scanUUID(bytes);

  console.log(`File: ${filePath}`);
  console.log(`UUIDs: ${results.length}`);
  console.log("");

  for (const u of results) {
    console.log(`  ${u.evidence.join(", ")} conf=${u.confidence.toFixed(2)}`);
  }

  return 0;
}
