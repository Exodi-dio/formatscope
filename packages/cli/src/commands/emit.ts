import { readFile } from "node:fs/promises";
import { codegen } from "@formatscope/core";

export async function emit(args: string[]): Promise<number> {
  if (args.length < 1 || args.length > 2) {
    console.error("Usage: formatscope emit <schema.json> [output.ts]");
    return 2;
  }

  const [schemaPath, outputPath] = args;

  let schemaText: string;
  try {
    schemaText = await readFile(schemaPath, "utf8");
  } catch (err) {
    console.error(`Cannot read schema: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  let schema: any;
  try {
    schema = JSON.parse(schemaText);
  } catch (err) {
    console.error(`Invalid JSON schema: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const result = codegen(schema as any);

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
