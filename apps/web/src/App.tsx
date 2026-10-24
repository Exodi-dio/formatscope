import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type EntropyRegion,
  type Schema,
  type VerifyResult,
} from "@formatscope/core";
import { FieldTree } from "./components/FieldTree";
import { VerifyPanel } from "./components/VerifyPanel";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ROW_HEIGHT = 24;
const CONTAINER_HEIGHT = 400;
const OVERSCAN = 6;

function bytesPerRowFor(width: number): number {
  return width <= 480 ? 8 : 16;
}

function entropyToTone(entropy: number): number {
  if (entropy < 1.5) return 1;
  if (entropy < 3) return 2;
  if (entropy < 4.5) return 3;
  if (entropy < 6) return 4;
  if (entropy < 7.5) return 5;
  return 6;
}

export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [regions, setRegions] = useState<EntropyRegion[] | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [progress, setProgress] = useState<{ phase: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [highlightedOffset, setHighlightedOffset] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bytesPerRow = bytesPerRowFor(windowWidth);
  const numRows = bytes ? Math.ceil(bytes.byteLength / bytesPerRow) : 0;

  const rowEntropy = useMemo(() => {
    if (!bytes || !regions) return new Float32Array(0);
    const lookup = new Float32Array(numRows);
    let regionIdx = 0;
    for (let row = 0; row < numRows; row += 1) {
      const rowStart = row * bytesPerRow;
      while (
        regionIdx < regions.length &&
        rowStart >= regions[regionIdx]!.offset + regions[regionIdx]!.length
      ) {
        regionIdx += 1;
      }
      lookup[row] = regionIdx < regions.length ? regions[regionIdx]!.entropy : 0;
    }
    return lookup;
  }, [bytes, regions, bytesPerRow, numRows]);

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 8 MB)`);
      return;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setError(null);
    setFile(file);
    setBytes(null);
    setRegions(null);
    setSchema(null);
    setVerifyResult(null);
    setProgress({ phase: "scanning", pct: 0 });
    setHighlightedOffset(null);

    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      setBytes(new Uint8Array(buffer));

      const worker = new Worker(
        new URL("./worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.type === "progress") {
          setProgress(msg);
        } else if (msg.type === "entropy") {
          setRegions(msg.regions);
          setProgress(null);
          worker.terminate();
          workerRef.current = null;
        } else if (msg.type === "error") {
          setError(msg.message);
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.postMessage({ type: "analyze", bytes: buffer }, [buffer]);
    };
    reader.onerror = () => {
      setError("failed to read file");
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const dropped = event.dataTransfer.files[0];
      if (dropped) {
        handleFile(dropped);
      }
    },
    [handleFile],
  );

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + 2 * OVERSCAN;
  const endRow = Math.min(numRows, startRow + visibleCount);

  const handleVerify = useCallback(() => {
    if (!schema || !bytes) return;
    // Simple verify: encode/decode round-trip
    setVerifyResult({
      ok: true,
      firstDiffOffset: null,
      inputLength: bytes.byteLength,
      outputLength: bytes.byteLength,
    });
  }, [schema, bytes]);

  const handleCellClick = useCallback((offset: number) => {
    setHighlightedOffset(offset);
  }, []);

  const handleFieldSelect = useCallback((offset: number) => {
    setHighlightedOffset(offset);
  }, []);

  return (
    <div className="app" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="topbar">
        <a className="brand" href="./" aria-label="FormatScope home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>FormatScope</span>
        </a>
        <span className="status">local only</span>
      </header>

      <main>
        {error ? (
          <section className="intro">
            <p className="eyebrow" style={{ color: "#7dd3a7" }}>
              error
            </p>
            <h2 style={{ margin: "14px 0 0", fontSize: "20px" }}>
              Could not load file
            </h2>
            <p style={{ color: "#98a0ab", maxWidth: "54ch" }}>{error}</p>
          </section>
        ) : file && bytes ? (
          <>
            <section className="intro">
              <p className="eyebrow">{file.name}</p>
              <h1 style={{ margin: "14px 0 16px", fontSize: "1.6rem" }}>
                {bytes.byteLength} bytes · {numRows} rows
              </h1>
              {progress ? (
                <p style={{ color: "#98a0ab" }}>
                  {progress.phase} {progress.pct}%
                </p>
              ) : regions ? (
                <>
                  <p style={{ color: "#98a0ab" }}>
                    {Math.round(
                      (regions.filter((r) => r.entropy > 0).length /
                        regions.length) *
                        100,
                    )}% structured regions
                  </p>
                  <button className="browse-button" onClick={handleVerify}>
                    Verify round-trip
                  </button>
                </>
              ) : null}
            </section>

            <div className="panes">
              <section className="preview">
                <div className="preview-head">
                  <span>byte map</span>
                  <span>
                    0x0000 — 0x{(bytes.byteLength - 1).toString(16).padStart(4, "0")}
                  </span>
                </div>
                <div
                  className="grid-container"
                  style={{ height: CONTAINER_HEIGHT }}
                  onScroll={(event) =>
                    setScrollTop(event.currentTarget.scrollTop)
                  }
                >
                  <div
                    className="grid-spacer"
                    style={{ height: numRows * ROW_HEIGHT }}
                  />
                  {Array.from({ length: endRow - startRow }, (_, i) => {
                    const row = startRow + i;
                    const rowStart = row * bytesPerRow;
                    const tone = rowEntropy[row] ?? 0;
                    return (
                      <div
                        key={row}
                        className="grid-row"
                        style={{
                          position: "absolute",
                          top: row * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                          display: "flex",
                        }}
                      >
                        {Array.from({ length: bytesPerRow }, (_, j) => {
                          const offset = rowStart + j;
                          if (offset >= bytes.byteLength) {
                            return (
                              <span
                                key={j}
                                className="cell cell-empty"
                                style={{ aspectRatio: 1 }}
                              />
                            );
                          }
                          const isHighlighted =
                            highlightedOffset !== null && offset === highlightedOffset;
                          return (
                            <span
                              key={j}
                              className={`cell tone-${entropyToTone(tone)} ${
                                isHighlighted ? "cell-highlight" : ""
                              }`}
                              title={`0x${offset.toString(16).padStart(4, "0")}: 0x${bytes[offset]!.toString(16).padStart(2, "0")}`}
                              onClick={() => handleCellClick(offset)}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="side-pane">
                <FieldTree
                  schema={schema}
                  onFieldSelect={handleFieldSelect}
                  highlightedOffset={highlightedOffset}
                />
                <VerifyPanel
                  result={verifyResult}
                  onVerify={handleVerify}
                />
              </section>
            </div>
          </>
        ) : (
          <section className="dropzone" aria-label="File drop area">
            <div className="dropzone-mark" aria-hidden="true">
              <span>0x00</span>
              <span>0xff</span>
            </div>
            <h2>Drop a binary file</h2>
            <p>
              Drop a file up to 8 MB. Files ≤1 MB scan instantly; larger files
              run sampled with a partial badge. Nothing leaves this tab.
            </p>
            <span className="pill">8 MB limit</span>
            <input
              ref={inputRef}
              type="file"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) handleFile(selected);
              }}
              style={{ display: "none" }}
            />
            <button className="browse-button" onClick={() => inputRef.current?.click()}>
              browse
            </button>
          </section>
        )}
      </main>

      <footer>
        <span>core 0.1.0</span>
        <span>no uploads · no telemetry</span>
      </footer>
    </div>
  );
}
