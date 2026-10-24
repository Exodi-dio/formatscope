import { scanEntropy, type EntropyRegion } from "@formatscope/core";

const WINDOW_SIZE = 16;

self.onmessage = (event: MessageEvent<{ type: "analyze"; bytes: ArrayBuffer }>) => {
  const { bytes } = event.data;

  const uint8 = new Uint8Array(bytes);

  self.postMessage({ type: "progress", phase: "scanning", pct: 0 });

  const regions = scanEntropy(uint8, WINDOW_SIZE);

  self.postMessage({ type: "progress", phase: "scanning", pct: 100 });
  self.postMessage({ type: "entropy", regions } as const);
};
