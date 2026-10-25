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

      <div className="shell">
        <aside className="sidebar">
          <nav className="nav">
            <a className="nav-item" href="#">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </a>
            <a className="nav-item nav-item-active" href="#">
              <span className="nav-icon">📋</span>
              <span className="nav-label">Tasks</span>
            </a>
            <a className="nav-item" href="#">
              <span className="nav-icon">📥</span>
              <span className="nav-label">Inbox</span>
            </a>
            <a className="nav-item" href="#">
              <span className="nav-icon">📅</span>
              <span className="nav-label">Calendar</span>
            </a>
            <a className="nav-item" href="#">
              <span className="nav-icon">👥</span>
              <span className="nav-label">Meeting</span>
            </a>
            <a className="nav-item" href="#">
              <span className="nav-icon">📦</span>
              <span className="nav-label">Dock</span>
            </a>
          </nav>
        </aside>

        <main className="main">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search" />
            <span className="search-divider">/</span>
          </div>
          <div className="content">
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">No tasks yet.</p>
          </div>
        </main>
      </div>

      <footer>
        <span>core 0.1.0</span>
        <span>no uploads · no telemetry</span>
      </footer>
    </div>
  );
}