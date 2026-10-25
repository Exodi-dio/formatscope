#!/usr/bin/env node

import { inspect } from "./commands/inspect.js";
import { infer } from "./commands/infer.js";
import { emit } from "./commands/emit.js";
import { verify } from "./commands/verify.js";
import { diff } from "./commands/diff.js";
import { scan } from "./commands/scan.js";
import { strings } from "./commands/strings.js";
import { magic } from "./commands/magic.js";
import { x86 } from "./commands/x86.js";
import { uuid } from "./commands/uuid.js";
import { timestamp } from "./commands/timestamp.js";
import { ip } from "./commands/ip.js";

const commands: Record<string, (args: string[]) => Promise<number>> = {
  inspect,
  infer,
  emit,
  verify,
  diff,
  scan,
  strings,
  magic,
  x86,
  uuid,
  timestamp,
  ip,
};

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  console.log("Usage: formatscope <command> [args]");
  console.log("");
  console.log("Commands:");
  console.log("  inspect <file>    Show file info and entropy map");
  console.log("  infer  <file>     Infer structure and show schema");
  console.log("  emit   <schema>   Generate a TypeScript parser from schema");
  console.log("  verify <file>     Verify byte-for-byte round-trip");
  console.log("  diff   <f1> <f2>  Semantic diff between two files");
  console.log("  scan   <file>     Show all inference rules that matched");
  console.log("  strings <file>    List printable string runs");
  console.log("  magic  <file>     List detected magic headers");
  console.log("  x86    <file>     List x86 opcode runs");
  console.log("  uuid   <file>     List UUID/GUID patterns");
  console.log("  timestamp <file>  List unix timestamps");
  console.log("  ip     <file>     List IP addresses");
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
