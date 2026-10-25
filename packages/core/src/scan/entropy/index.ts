export interface EntropyRegion {
  readonly offset: number;
  readonly length: number;
  readonly entropy: number;
}

export function scanEntropy(
  bytes: Uint8Array,
  windowSize: number,
): EntropyRegion[] {
  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    throw new RangeError(`invalid window size: ${windowSize}`);
  }

  const regions: EntropyRegion[] = [];
  const step = Math.min(windowSize, bytes.byteLength);

  for (let offset = 0; offset < bytes.byteLength; offset += step) {
    const length = Math.min(step, bytes.byteLength - offset);
    regions.push({
      offset,
      length,
      entropy: shannonEntropy(bytes.subarray(offset, offset + length)),
    });
  }

  return regions;
}

// shannon entropy over a byte window
function shannonEntropy(window: Uint8Array): number {
  const length = window.byteLength;
  if (length === 0) return 0;

  const counts = new Uint32Array(256);

  for (let i = 0; i < length; i++) {
    const sym = window[i];
    if (sym === undefined) continue;
    const cur = counts[sym] ?? 0;
    counts[sym] = cur + 1;
  }

  let entropy = 0;
  const invLen = 1 / length;

  for (let s = 0; s < 256; s++) {
    const c = counts[s];
    if (c === undefined || c === 0) continue;
    const p = c * invLen;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}
