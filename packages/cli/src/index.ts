#!/usr/bin/env node

import { inspect } from "./commands/inspect.js";
import { infer } from "./commands/infer.js";
import { emit } from "./commands/emit.js";
import { verify } from "./commands/verify.js";
import { diff } from "./commands/diff.js";

const commands: Record<string, (args: string[]) => Promise<number>> = {
  inspect,
  infer,
  emit,
  verify,
  diff,
};

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  console.log("Usage: formatscope <command> [args]");
  console.log("");
  console.log("Commands:");
  console.log("  inspect <file>    Show file info and entropy map");
  console.log("  infer <file>      Infer structure and show schema");
  console.log("  emit <schema>     Generate a TypeScript parser from schema");
  console.log("  verify <file>     Verify byte-for-byte round-trip");
  console.log("  diff <file1> <file2>  Semantic diff between two files");
  process.exit(0);
}

const cmd = commands[command];

if (!cmd) {
  console.error(`Unknown command: ${command}`);
  console.log("Run 'formatscope --help' for usage.");
  process.exit(2);
}

cmd(args).then((exitCode) => {
  process.exit(exitCode);
}).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(2);
});
