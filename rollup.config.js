import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import Handlebars from "handlebars";

// Custom Handlebars precompile plugin that returns template functions (strings, not DOM)
const hbsPlugin = () => ({
  name: 'hbs-precompile',
  transform(code, id) {
    if (!id.endsWith('.hbs')) return null;
    const spec = Handlebars.precompile(code);
    return {
      code: `
        import HandlebarsRuntime from 'handlebars/runtime';
        const Handlebars = HandlebarsRuntime.default || HandlebarsRuntime;
        export default Handlebars.template(${spec});
      `,
      map: { mappings: '' }
    };
  }
});

const isWatch = process.env.ROLLUP_WATCH === "true";

const esmConfig = {
  input: "src/index.ts",
  output: {
    file: "dist/avaliacao-layout.esm.js",
    format: "esm", // gera um bundle ESM
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: { declaration: false, declarationMap: false, declarationDir: undefined }
    }),
    hbsPlugin(),
    !isWatch && terser(),
  ],
};

const cjsConfig = {
  input: "src/index.ts",
  output: {
    file: "dist/avaliacao-layout.cjs",
    format: "cjs", // CommonJS
    exports: "auto",
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: "./tsconfig.json" }),
    hbsPlugin(),
    !isWatch && terser(),
  ],
};

const umdConfig = {
  input: "src/index.ts",
  output: {
    file: "dist/avaliacao-layout.umd.js",
    format: "umd", // ou "iife"
    name: "AvaliacaoLayout", // nome global no browser
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: "./tsconfig.json" }),
    hbsPlugin(),
    !isWatch && terser(),
    isWatch &&
    serve({
      open: true,
      contentBase: ["", "dist"], // serve root and dist
      port: 10001,
    }),
    isWatch && livereload("dist"),
  ],
};

const dtsConfig = {
  input: "types/index.d.ts", // gerado pelo tsc (via plugin typescript no primeiro passo)
  output: {
    file: "dist/avaliacao-layout.d.ts",
    format: "es",
  },
  plugins: [dts()],
};

export default isWatch ? [umdConfig] : [esmConfig, cjsConfig, umdConfig, dtsConfig];
