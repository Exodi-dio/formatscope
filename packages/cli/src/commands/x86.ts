import { readFile } from "node:fs/promises";
import { scanX86 } from "@formatscope/core";

export async function x86(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope x86 <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = new Uint8Array(await readFile(filePath) as Buffer);
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const results = scanX86(bytes);

  console.log(`File: ${filePath}`);
  console.log(`x86 opcode runs: ${results.length}`);
  console.log("");

  for (const x of results) {
    console.log(`  ${x.evidence.join(", ")} conf=${x.confidence.toFixed(2)}`);
  }

  return 0;
}
