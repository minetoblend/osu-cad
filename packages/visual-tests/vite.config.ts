/// <reference types='vitest' />
import * as path from "path";
import { defaultClientConditions, defineConfig } from "vite";

import { dependencies } from "./package.json";
import { visualTests } from "./plugin";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/core",
  plugins: [
    visualTests(),
  ],
  resolve: {
    conditions: [
      ...defaultClientConditions,
      ...(process.env.NODE_ENV === "development" ? ["source"] : []),
    ],
  },
  build: {
    outDir: "./dist",
    emptyOutDir: false,
    reportCompressedSize: false,
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
    target: "esnext",
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
