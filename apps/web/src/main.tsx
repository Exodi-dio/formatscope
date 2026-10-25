import ReactDOM from "react-dom/client";

import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("missing #root element");
}

try {
  ReactDOM.createRoot(container).render(<App />);
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  container.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #ff6b6b; font-family: system-ui, sans-serif;">
      <h2>React mount error</h2>
      <p>${message}</p>
      <button onclick="window.location.reload()" style="padding: 0.8rem 1.5rem; background: #7dd3a7; color: #0b0c0e; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Refresh</button>
    </div>
  `;
}