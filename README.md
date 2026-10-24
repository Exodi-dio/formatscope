# FormatScope — binary format workbench

Infer the structure of an unknown binary file, generate a parser, and prove it
with a byte-for-byte round-trip. Nothing leaves this tab.

## Demo

Drop a binary file and watch FormatScope map the bytes, infer the structure,
generate a parser, and verify it by round-tripping the original file exactly.

[Try FormatScope](https://exodi-dio.github.io/formatscope/)

## Install

```bash
npx formatscope
```

## CLI

```text
formatscope inspect <file>    Show file info and entropy map
formatscope infer  <file>     Infer structure and show schema
formatscope emit   <schema>   Generate a TypeScript parser from schema
formatscope verify <file>     Verify byte-for-byte round-trip
formatscope diff   <f1> <f2>  Semantic diff between two files
```

Exit codes: `0` OK, `1` round-trip mismatch, `2` usage error.

## How it works

1. **Drop a file** — read it in the browser (nothing is uploaded).
2. **Entropy scan** — the worker computes Shannon entropy over sliding windows,
   colouring each byte region by randomness.
3. **Inference** — scan rules detect magic headers, string runs, periodicity,
   length-prefixed records, TLV containers, and checksums.
4. **Parser generation** — the inferred schema is turned into readable TypeScript.
5. **Verify** — the schema interpreter round-trips the file byte-for-byte and
   reports the first differing byte if anything changed.

## Limits

- Maximum file size: 8 MB
- Files ≤ 1 MB scan instantly
- Files 1–8 MB are sampled with a “partial” badge
- No compressed, encrypted, or obfuscated formats in v1
- No untrusted code execution — verification runs a schema interpreter

## Formats

FormatScope ships with three synthetic sample formats for testing:

- **FSBX** — chunked container (4-byte tag + u32 length + payload)
- **FSRT** — fixed record table (8/12/16-byte records + trailing CRC32)
- **FSTL** — length-prefixed TLV log with string table

Each format ships in v1 and v2 variants to test semantic diffing.

## Roadmap

- Magic, string, periodicity, length-prefix, TLV, and checksum inference
- Schema-driven parser generation with node→line mapping
- Semantic diff between file versions
- CLI: inspect, infer, emit, verify, diff
- GitHub Pages demo with sample files

## License

MIT
