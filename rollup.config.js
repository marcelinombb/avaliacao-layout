import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import terser  from "@rollup/plugin-terser";

export default [

  // Bundle para Browser (IIFE ou UMD)
  {
    input: "src/index.js",
    output: {
      file: "dist/avaliacao-layout.umd.js",
      format: "umd", // ou "iife"
      name: "AvaliacaoLayout", // nome global no browser
    },
    plugins: [resolve(), commonjs(), json(), terser()],
  },
  {
    input: "types/index.d.ts", // gerado pelo tsc
    output: {
      file: "dist/avaliacao-layout.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
