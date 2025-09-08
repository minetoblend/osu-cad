/// <reference types='vitest' />
import { defaultClientConditions, defineConfig } from "vite";

import { dependencies } from "./package.json";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/ruleset-osu",
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
        "src/init.ts",
      ],
      name: "@osucad/ruleset-osu",
      formats: ["es" as const],
    },
    minify: false,
    target: "modules",
    sourcemap: true,
    rollupOptions: {
      output: {
        preserveModules: true,
      },
      external: [
        ...Object.keys(dependencies),
      ],
    },
  },
}));
