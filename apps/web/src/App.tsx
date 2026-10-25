export function App() {
  return (
    <div
      style={{
        background: "#0b0c0e",
        color: "#eceef1",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "#111318",
            border: "1px solid #242a33",
            borderRadius: "16px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                background: "#111318",
                border: "1px solid #242a33",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
              >
                ☐
              </div>
              <span style={{ fontSize: "1.25rem", fontWeight: "600", letterSpacing: "-0.02em" }}>
                FormatScope
              </span>
              <div style={{ marginLeft: "auto" }} />
              <div style={{
                width: "20px",
                height: "20px",
                background: "#111318",
                border: "1px solid #242a33",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              >
                <span style={{ fontSize: "12px" }}>⌃</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{
              background: "#111318",
              border: "1px solid #242a33",
              borderRadius: "10px",
              padding: "10px 14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            >
              <span style={{ color: "#98a0ab", marginRight: "10px" }}>🔍</span>
              <span style={{ color: "#eceef1", fontSize: "0.95rem" }}>Search</span>
              <div style={{ marginLeft: "auto", color: "#98a0ab", fontSize: "14px" }}>
                /
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{
                padding: "10px 14px",
                color: "#98a0ab",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#7dd3a7" }}>🏠</div>
                <span style={{ flex: 1 }}>Dashboard</span>
              </div>
              <div style={{
                background: "#151920",
                border: "1px solid #242a33",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#7dd3a7" }}>📋</div>
                <span style={{ flex: 1 }}>Tasks</span>
              </div>
              <div style={{
                padding: "10px 14px",
                color: "#98a0ab",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#98a0ab" }}>📥</div>
                <span style={{ flex: 1 }}>Inbox</span>
              </div>
              <div style={{
                padding: "10px 14px",
                color: "#98a0ab",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#98a0ab" }}>📅</div>
                <span style={{ flex: 1 }}>Calendar</span>
              </div>
              <div style={{
                padding: "10px 14px",
                color: "#98a0ab",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#98a0ab" }}>👥</div>
                <span style={{ flex: 1 }}>Meeting</span>
              </div>
              <div style={{
                padding: "10px 14px",
                color: "#555",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              >
                <div style={{ color: "#555" }}>📦</div>
                <span style={{ flex: 1 }}>Dock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}