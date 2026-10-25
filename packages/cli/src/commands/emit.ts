import * as fs from "node:fs";
import { codegen } from "@formatscope/core";

export async function emit(args: string[]): Promise<number> {
  if (args.length < 1 || args.length > 2) {
    console.error("Usage: formatscope emit <schema.json> [output.ts]");
    return 2;
  }

  const [schemaPath, outputPath] = args;

  let schemaText: string;
  try {
    schemaText = fs.readFileSync(schemaPath, "utf8");
  } catch (err) {
    console.error(`Cannot read schema: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  let schema: Record<string, unknown>;
  try {
    schema = JSON.parse(schemaText);
  } catch (err) {
    console.error(`Invalid JSON schema: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const result = codegen(schema as Record<string, unknown>);

  if (outputPath) {
    import("node:fs/promises").then(({ writeFile }) => {
      writeFile(outputPath, result.source).then(() => {
        console.log(`Parser emitted to ${outputPath}`);
      }).catch((err) => {
        console.error(`Cannot write output: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(2);
      });
    });
  } else {
    console.log(result.source);
  }

  return 0;
}
