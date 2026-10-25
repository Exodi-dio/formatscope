import * as fs from "node:fs";
import { scanIPs } from "@formatscope/core";

export async function ip(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope ip <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = fs.readFileSync(filePath) as unknown as Uint8Array;
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const results = scanIPs(bytes);

  console.log(`File: ${filePath}`);
  console.log(`IP addresses: ${results.length}`);
  console.log("");

  for (const ip of results) {
    console.log(`  ${ip.evidence.join(", ")} conf=${ip.confidence.toFixed(2)}`);
  }

  return 0;
}
