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
        FormatScope works!
      </h1>
      <p style={{ color: "#98a0ab" }}>
        React is rendering on mobile!
      </p>
    </div>
  );
}