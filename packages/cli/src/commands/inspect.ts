import { readFile } from "node:fs/promises";
import { scanEntropy } from "@formatscope/core";

export async function inspect(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope inspect <file>");
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

  const regions = scanEntropy(bytes, 16);

  console.log(`File: ${filePath}`);
  console.log(`Size: ${bytes.byteLength} bytes`);
  console.log(`Entropy regions: ${regions.length}`);
  console.log("");

  for (const region of regions) {
    const bar = "#".repeat(Math.round(region.entropy * 4));
    console.log(
      `  0x${region.offset.toString(16).padStart(4, "0")} ` +
      `len=${region.length.toString().padStart(3)} ` +
      `ent=${region.entropy.toFixed(2)} ` +
      `${bar}`,
    );
  }

  return 0;
}
