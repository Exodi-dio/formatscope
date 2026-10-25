import { readFile } from "node:fs/promises";
import { decode, encode, verifyBytes } from "@formatscope/core";

export async function verify(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope verify <file>");
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

  const schema = {
    version: 1,
    byteLength: bytes.byteLength,
    root: {
      kind: "opaque",
      offset: 0,
      length: bytes.byteLength,
      confidence: 0,
      evidence: [],
    },
  };

  const doc = decode(schema, bytes);
  const output = encode(doc);
  const result = verifyBytes(bytes, output);

  if (result.ok) {
    console.log(`Verify OK: ${bytes.byteLength} bytes round-trip byte-for-byte`);
    return 0;
  } else {
    console.log(`Verify FAILED: first differing byte at offset ${result.firstDiffOffset}`);
    console.log(`  Input length:  ${result.inputLength}`);
    console.log(`  Output length: ${result.outputLength}`);
    return 1;
  }
}
