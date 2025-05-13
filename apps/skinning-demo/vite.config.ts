/// <reference types='vitest' />
import { defaultClientConditions, defineConfig } from "vite";
import ConditionalCompile from "vite-plugin-conditional-compiler";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/web",
  optimizeDeps: {
    exclude: ["mp4-wasm"],
  },
  resolve: {
    conditions: [
      ...defaultClientConditions,
      ...(process.env.NODE_ENV === "development" ? ["source"] : []),
    ],
  },
  server:{
    port: 4200,
    host: "localhost",
  },
  preview: {
    port: 80,
    host: "0.0.0.0",
  },
  plugins: [ConditionalCompile()],
  worker: {
    format: "es" as const,
  },
  esbuild: {
    target: "chrome138",
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    target: "esnext",
    minify: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
