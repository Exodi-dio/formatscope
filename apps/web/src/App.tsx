import { useState } from "react";

export function App() {
  const [loaded, setLoaded] = useState(false);

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
        Binary format workbench — loading…
      </p>
      <button
        onClick={() => setLoaded(true)}
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
        {loaded ? "Loaded!" : "Click to load app"}
      </button>
      {loaded && (
        <div style={{ marginTop: "2rem", color: "#eceef1" }}>
          <p>React is working!</p>
          <p>Drop zone would go here.</p>
        </div>
      )}
    </div>
  );
}