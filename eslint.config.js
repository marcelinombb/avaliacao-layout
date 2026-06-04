import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "complexity": ["error", 10],
      "max-depth": ["error", 3],
      "max-nested-callbacks": ["error", 3],
      "max-lines-per-function": [
        "error",
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "rollup.config.js"],
  }
);
