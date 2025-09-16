/// <reference types='vitest' />
import { visualTests } from "@osucad/visual-tests/plugin";
import { defaultClientConditions, defineConfig } from "vite";

import { dependencies } from "./package.json";

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
  esbuild: {
    target: ["chrome138"],
  },
  build: {
    outDir: "./dist",
    emptyOutDir: false,
    reportCompressedSize: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: [
        "src/index.ts",
        "src/Editor.ts",
        "src/runtime/index.ts",
      ],
      name: "@osucad/editor",
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ["es" as const],
    },
    minify: false,
    target: "esnext",
    sourcemap: true,
    rollupOptions: {
      output: { preserveModules: true },
      // External packages that should not be bundled into your library.
      external: [
        ...Object.keys(dependencies),
      ],
    },
  },
}));
