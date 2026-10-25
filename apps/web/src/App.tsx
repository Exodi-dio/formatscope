import React from "react";

export function App() {
  return React.createElement("div", {
    style: {
      background: "#0b0c0e",
      color: "#7dd3a7",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }
  }, React.createElement("h1", { style: { fontSize: "2rem", marginBottom: "1rem" } }, "FormatScope"), React.createElement("p", { style: { color: "#98a0ab" } }, "Binary format workbench"));
}