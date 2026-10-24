import { readFile } from "node:fs/promises";
import { diff, decode } from "@formatscope/core";

export async function diff(args: string[]): Promise<number> {
  if (args.length !== 2) {
    console.error("Usage: formatscope diff <file1> <file2>");
    return 2;
  }

  const [filePath1, filePath2] = args;

  let bytes1: Uint8Array;
  let bytes2: Uint8Array;

  try {
    bytes1 = new Uint8Array(await readFile(filePath1));
    bytes2 = new Uint8Array(await readFile(filePath2));
  } catch (err) {
    console.error(`Cannot read file: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const schema1 = {
    version: 1,
    byteLength: bytes1.byteLength,
    root: {
      kind: "opaque",
      offset: 0,
      length: bytes1.byteLength,
      confidence: 0,
      evidence: [],
    },
  };
  const schema2 = {
    version: 1,
    byteLength: bytes2.byteLength,
    root: {
      kind: "opaque",
      offset: 0,
      length: bytes2.byteLength,
      confidence: 0,
      evidence: [],
    },
  };

  const doc1 = decode(schema1, bytes1);
  const doc2 = decode(schema2, bytes2);

  const result = diff(doc1, doc2);

  console.log(`Diff: ${filePath1} vs ${filePath2}`);
  console.log(`  Added:   ${result.summary.added}`);
  console.log(`  Removed: ${result.summary.removed}`);
  console.log(`  Changed: ${result.summary.changed}`);
  console.log(`  Same:    ${result.summary.unchanged}`);
  console.log("");

  for (const change of result.changes) {
    if (change.kind === "unchanged") continue;
    const oldVal = change.oldValue ?? "null";
    const newVal = change.newValue ?? "null";
    console.log(`  ${change.kind.padEnd(8)} ${change.path}: ${oldVal} → ${newVal}`);
  }

  return result.summary.changed > 0 || result.summary.added > 0 || result.summary.removed > 0 ? 0 : 0;
}
