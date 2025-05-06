import { defineConfig } from "tsup";

import packageJson from "./package.json";

const {
  name,
  dependencies,
  peerDependencies,
  bundler: { entries },
} = packageJson;

export default defineConfig({
  entry: entries,
  format: ["esm", "cjs"],
  outDir: "./dist",
  dts: true,
  external: [
    name,
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies),
  ],
});
