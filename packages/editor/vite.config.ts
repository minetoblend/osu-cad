/// <reference types='vitest' />
import { defaultClientConditions, defineConfig } from "vite";
import dts from "vite-plugin-dts";
import * as path from "path";

import { dependencies } from "./package.json";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/core",
  plugins: [dts({ entryRoot: "src", tsconfigPath: path.join(__dirname, "tsconfig.lib.json") })],
  resolve: {
    conditions: [
      ...defaultClientConditions,
      ...(process.env.NODE_ENV === "development" ? ["source"] : []),
    ],
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: "src/index.ts",
      name: "@osucad/core",
      fileName: "index",
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ["es" as const],
    },
    minify: false,
    target: "modules",
    sourcemap: true,
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        ...Object.keys(dependencies),
      ],
    },
  },
}));
