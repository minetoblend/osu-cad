// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@osucad/storybook-vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const path = require("path");

const config: StorybookConfig = {
  stories: [
    path.resolve(__dirname, "../src/stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx))").replaceAll("\\", "/"),
  ],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@osucad/storybook-vite"),
    options: {
      builder: {
        viteConfigPath: "vite.config.ts",
      },
    },
  },
};

export default config;

function getAbsolutePath(value: string): any
{
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
