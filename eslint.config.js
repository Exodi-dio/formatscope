import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/playwright-report/**",
      "**/test-results/**",
      ".pair/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { "prefer": "type-imports" },
      ],
    },
  },
  {
    files: ["**/*.config.{js,ts}", "**/vite.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
