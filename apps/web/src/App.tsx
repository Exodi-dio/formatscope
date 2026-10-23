import { CORE_VERSION } from "@formatscope/core";

const CELLS = 128;

export function App() {
  return (
    <div className="app">
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
        <section className="intro">
          <p className="eyebrow">Binary format workbench</p>
          <h1>See the structure inside an unknown file.</h1>
          <p className="lede">
            Infer fields, generate a parser, and prove it with a byte-for-byte
            round-trip. Nothing leaves this tab.
          </p>
        </section>

        <section className="dropzone" aria-label="File drop area">
          <div className="dropzone-mark" aria-hidden="true">
            <span>0x00</span>
            <span>0xff</span>
          </div>
          <h2>Drop a binary file</h2>
          <p>
            The inference engine is not wired up in this build. The byte map
            lands next.
          </p>
          <span className="pill">8 MB limit</span>
        </section>

        <section className="preview" aria-hidden="true">
          <div className="preview-head">
            <span>byte map</span>
            <span>0x0000 — 0x00ff</span>
          </div>
          <div className="cells">
            {Array.from({ length: CELLS }, (_, index) => (
              <span className={`cell tone-${index % 7}`} key={index} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <span>core {CORE_VERSION}</span>
        <span>no uploads · no telemetry</span>
      </footer>
    </div>
  );
}
