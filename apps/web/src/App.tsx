export function App() {
  return (
    <div
      style={{
        background: "#0b0c0e",
        color: "#7dd3a7",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        FormatScope
      </h1>
      <p style={{ color: "#98a0ab", marginBottom: "1.5rem" }}>
        React is loading…
      </p>
      <button
        onClick={() => {
          const btn = document.getElementById("test-btn");
          if (btn) btn.textContent = "React works!";
        }}
        id="test-btn"
        style={{
          padding: "0.8rem 1.5rem",
          background: "#7dd3a7",
          color: "#0b0c0e",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Click me
      </button>
      <div style={{ marginTop: "2rem", color: "#eceef1" }}>
        <p id="status">Waiting for React...</p>
      </div>
    </div>
  );
}