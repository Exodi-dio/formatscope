import { readFile } from "node:fs/promises";
import { scanMagic } from "@formatscope/core";

export async function magic(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope magic <file>");
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

  const results = scanMagic(bytes);

  console.log(`File: ${filePath}`);
  console.log(`Magic headers: ${results.length}`);
  console.log("");

  for (const m of results) {
    console.log(`  ${m.evidence.join(", ")} conf=${m.confidence.toFixed(2)}`);
  }

  return 0;
}
