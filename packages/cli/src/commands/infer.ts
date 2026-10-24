import { readFile } from "node:fs/promises";
import { scanEntropy, type Schema } from "@formatscope/core";

export async function infer(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope infer <file>");
    return 2;
  }

  const [filePath] = args;
  let bytes: Uint8Array;

  try {
    bytes = new Uint8Array(await readFile(filePath));
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const regions = scanEntropy(bytes, 16);

  console.log(`File: ${filePath}`);
  console.log(`Size: ${bytes.byteLength} bytes`);
  console.log(`Regions: ${regions.length}`);
  console.log("");

  for (const region of regions) {
    console.log(
      `  0x${region.offset.toString(16).padStart(4, "0")} ` +
      `len=${region.length} ent=${region.entropy.toFixed(2)}`,
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
