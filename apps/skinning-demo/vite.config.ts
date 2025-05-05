/// <reference types='vitest' />
import { defineConfig } from "vite";
import ConditionalCompile from "vite-plugin-conditional-compiler";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/web",
  server:{
    port: 4200,
    host: "localhost",
  },
  preview:{
    port: 4300,
    host: "localhost",
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
