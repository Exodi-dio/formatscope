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
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>React Works!</h1>
      <p>React is rendering on mobile!</p>
    </div>
  );
}