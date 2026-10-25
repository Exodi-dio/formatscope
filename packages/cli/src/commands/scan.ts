import { readFile } from "node:fs/promises";
import {
  scanMagic,
  scanStrings,
  scanPeriodicity,
  scanLengthPrefix,
  scanChecksum,
} from "@formatscope/core";

export async function scan(args: string[]): Promise<number> {
  if (args.length !== 1) {
    console.error("Usage: formatscope scan <file>");
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

  const magic = scanMagic(bytes);
  const strings = scanStrings(bytes);
  const periodicity = scanPeriodicity(bytes);
  const lengthPrefix = scanLengthPrefix(bytes);
  const checksum = scanChecksum(bytes);

  console.log(`File: ${filePath}`);
  console.log(`Size: ${bytes.byteLength} bytes`);
  console.log("");

  if (magic.length > 0) {
    console.log("Magic headers:");
    for (const m of magic) {
      console.log(`  ${m.evidence.join(", ")}`);
    }
    console.log("");
  }

  if (strings.length > 0) {
    console.log("String runs:");
    for (const s of strings) {
      console.log(`  0x${s.offset.toString(16).padStart(4, "0")} len=${s.length} conf=${s.confidence.toFixed(2)}`);
    }
    console.log("");
  }

  if (periodicity.length > 0) {
    console.log("Periodicity:");
    for (const p of periodicity) {
      console.log(`  ${p.evidence.join(", ")} conf=${p.confidence.toFixed(2)}`);
    }
    console.log("");
  }

  if (lengthPrefix.length > 0) {
    console.log("Length-prefixed records:");
    for (const lp of lengthPrefix) {
      console.log(`  0x${lp.offset.toString(16).padStart(4, "0")} len=${lp.length} conf=${lp.confidence.toFixed(2)}`);
    }
    console.log("");
  }

  if (checksum.length > 0) {
    console.log("Checksums:");
    for (const c of checksum) {
      console.log(`  0x${c.offset.toString(16).padStart(4, "0")} len=${c.length} conf=${c.confidence.toFixed(2)}`);
    }
  }

  return 0;
}
