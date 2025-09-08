/// <reference types='vitest' />
import { defaultClientConditions, defineConfig } from "vite";
import * as path from "path";

import { dependencies } from "./package.json";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/core",
  // plugins: [dts({ entryRoot: "src", tsconfigPath: path.join(__dirname, "tsconfig.lib.json") })],
  resolve: {
    conditions: [
      ...defaultClientConditions,
      ...(process.env.NODE_ENV === "development" ? ["source"] : []),
    ],
  },
  build: {
    outDir: "./dist",
    emptyOutDir: false,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: [
        "src/index.ts",
      ],
      name: "@osucad/core",
      fileName: (format, entryName) => `${entryName.replace(/node_modules\//g, "external/")}.js`,
      formats: ["es" as const],
    },
    minify: false,
    target: "modules",
    sourcemap: true,
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: path.join(__dirname, "src"),
      },
      // External packages that should not be bundled into your library.
      external: [
        ...Object.keys(dependencies),
      ],
    },
  },
}));
