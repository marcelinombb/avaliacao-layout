import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default [
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
      name: "MyLib", // nome global no browser
    },
    plugins: [resolve(), commonjs(), json()],
  },
];
