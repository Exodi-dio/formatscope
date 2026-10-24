import { describe, expect, it } from "vitest";

import { generateAll } from "../src/index";

describe("corpus generator", () => {
  it("generates all six format variants", () => {
    const files = generateAll(0x12345678);

    expect(files).toHaveLength(6);

    const names = files.map((f) => f.name);
    expect(names).toContain("fsbx-v1");
    expect(names).toContain("fsbx-v2");
    expect(names).toContain("fsrt-v1");
    expect(names).toContain("fsrt-v2");
    expect(names).toContain("fstl-v1");
    expect(names).toContain("fstl-v2");
  });

  it("is deterministic: same seed produces identical output", () => {
    const a = generateAll(0xdeadbeef);
    const b = generateAll(0xdeadbeef);

    for (let i = 0; i < a.length; i += 1) {
      expect([...a[i]!.bytes]).toEqual([...b[i]!.bytes]);
    }
  });

  it("different seeds produce different output", () => {
    const a = generateAll(0x00000001);
    const b = generateAll(0x00000002);

    let anyDifferent = false;
    for (let i = 0; i < a.length; i += 1) {
      if ([...a[i]!.bytes].some((byte, j) => byte !== b[i]!.bytes[j])) {
        anyDifferent = true;
        break;
      }
    }
    expect(anyDifferent).toBe(true);
  });

  it("FSBX files start with the FSBX magic", () => {
    const files = generateAll(0x12345678);
    const fsbxV1 = files.find((f) => f.name === "fsbx-v1")!;
    const fsbxV2 = files.find((f) => f.name === "fsbx-v2")!;

    expect([...fsbxV1.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x42, 0x58]); // "FSBX"
    expect([...fsbxV2.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x42, 0x58]); // "FSBX"
    expect(fsbxV1.bytes[4]).toBe(1); // version 1
    expect(fsbxV2.bytes[4]).toBe(2); // version 2
  });

  it("FSRT files start with the FSRT magic", () => {
    const files = generateAll(0x12345678);
    const fsrtV1 = files.find((f) => f.name === "fsrt-v1")!;
    const fsrtV2 = files.find((f) => f.name === "fsrt-v2")!;

    expect([...fsrtV1.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x52, 0x54]); // "FSRT"
    expect([...fsrtV2.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x52, 0x54]); // "FSRT"
    expect(fsrtV1.bytes[4]).toBe(1); // version 1
    expect(fsrtV2.bytes[4]).toBe(2); // version 2
  });

  it("FSTL files start with the FSTL magic", () => {
    const files = generateAll(0x12345678);
    const fstlV1 = files.find((f) => f.name === "fstl-v1")!;
    const fstlV2 = files.find((f) => f.name === "fstl-v2")!;

    expect([...fstlV1.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x54, 0x4c]); // "FSTL"
    expect([...fstlV2.bytes.slice(0, 4)]).toEqual([0x46, 0x53, 0x54, 0x4c]); // "FSTL"
    expect(fstlV1.bytes[4]).toBe(1); // version 1
    expect(fstlV2.bytes[4]).toBe(2); // version 2
  });

  it("v1 and v2 of each format differ", () => {
    const files = generateAll(0x12345678);

    const pairs = [
      ["fsbx-v1", "fsbx-v2"],
      ["fsrt-v1", "fsrt-v2"],
      ["fstl-v1", "fstl-v2"],
    ];

    for (const [v1Name, v2Name] of pairs) {
      const v1 = files.find((f) => f.name === v1Name)!;
      const v2 = files.find((f) => f.name === v2Name)!;
      expect([...v1.bytes]).not.toEqual([...v2.bytes]);
    }
  });
});
