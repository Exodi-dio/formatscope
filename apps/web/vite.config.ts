import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const coreEntry = fileURLToPath(
  new URL("../../packages/core/src/index.ts", import.meta.url),
);

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@formatscope/core": coreEntry,
    },
  },
});
