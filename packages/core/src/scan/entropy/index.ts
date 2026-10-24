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

function shannonEntropy(window: Uint8Array): number {
  const length = window.byteLength;
  if (length === 0) {
    return 0;
  }

  const counts = new Uint32Array(256);

  for (let index = 0; index < length; index += 1) {
    counts[window[index]] += 1;
  }

  let entropy = 0;
  const invLength = 1 / length;

  for (let symbol = 0; symbol < 256; symbol += 1) {
    const count = counts[symbol];
    if (count === 0) {
      continue;
    }

    const p = count * invLength;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}
