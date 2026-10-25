export function App() {
  return (
    <div
      style={{
        background: "#ff0000",
        color: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>TEST</h1>
      <p style={{ color: "#ffffff", marginBottom: "2rem" }}>
        If you see this bright red screen, React is working on mobile!
      </p>
      <button
        onClick={() => {
          alert("React click works!");
        }}
        style={{
          padding: "1rem 2rem",
          background: "#ffffff",
          color: "#ff0000",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "1.2rem",
        }}
      >
        Click me
      </button>
    </div>
  );
}