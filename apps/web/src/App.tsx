export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">☐</div>
          <span>FormatScope</span>
        </div>
        <div className="status">local only</div>
      </header>

      <main>
        <section className="dropzone">
          <div className="dropzone-mark">
            <span>0x00</span>
            <span>0xff</span>
          </div>
          <h2>Drop a binary file</h2>
          <p>
            Drop a file up to 8 MB. Files ≤1 MB scan instantly; larger files
            run sampled with a partial badge. Nothing leaves this tab.
          </p>
          <span className="pill">8 MB limit</span>
          <button className="browse-button">browse</button>
        </section>
      </main>

      <footer>
        <span>core 0.1.0</span>
        <span>no uploads · no telemetry</span>
      </footer>
    </div>
  );
}