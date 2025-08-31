import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.js", // ponto de entrada da sua lib
    output: {
      file: "dist/index.esm.js",
      format: "esm", // gera um bundle ESM
    },
    plugins: [resolve(), commonjs(), json()],
  },
  // Bundle para Node.js (CommonJS)
  {
    input: "src/index.js",
    output: {
      file: "dist/index.cjs",
      format: "cjs", // CommonJS
      exports: "auto",
    },
    plugins: [resolve(), commonjs(), json()],
  },

  // Bundle para Browser (IIFE ou UMD)
  {
    input: "src/index.js",
    output: {
      file: "dist/index.umd.js",
      format: "umd", // ou "iife"
      name: "AvaliacaoLayout", // nome global no browser
    },
    plugins: [resolve(), commonjs(), json()],
  },
  {
    input: "types/index.d.ts", // gerado pelo tsc
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
