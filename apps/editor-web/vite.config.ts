/// <reference types='vitest' />
import { defaultClientConditions, defineConfig } from "vite";
import { moduleReplacer } from "./moduleReplacer";


export default defineConfig({
  root: __dirname,
  // cacheDir: "../../node_modules/.vite/apps/editor-web",
  resolve: {
    conditions: [
      ...defaultClientConditions,
      ...(process.env.NODE_ENV === "development" ? ["source"] : ["source"]),
    ],
  },
  optimizeDeps: {
  },
  plugins: [
    moduleReplacer({
      "@xmldom/xmldom": "export class DOMParser { }",
    }),
  ],
  server:{
    port: 4200,
    host: "localhost",
    allowedHosts: ["personalized-empty-pickup-magnitude.trycloudflare.com"],
    proxy: {
      "/socket.io/": {
        target: "http://localhost:3000",
        ws: true,
      },
      "/api/": {
        target: "http://localhost:3000",
      },
    },
  },
  preview: {
    port: 4200,
    host: "localhost",
    proxy: {
      "/socket.io/": {
        target: "http://localhost:3000",
        ws: true,
      },
      "/api/": {
        target: "http://localhost:3000",
      },
    },
  },
  worker: {
    format: "es" as const,
  },
  esbuild: {
    target: "chrome138",
    platform: "browser",
    treeShaking: true,
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    target: "esnext",
    minify: true,
    rollupOptions: {
      output: {
        esModule: true,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
