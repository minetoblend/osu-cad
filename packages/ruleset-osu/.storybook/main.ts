import type { StorybookConfig } from "@osucad/storybook-vite";
const path = require("path");

const config: StorybookConfig = {
  stories: [
    path.resolve(__dirname, "../src/stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx))").replaceAll("\\", "/"),
  ],
  addons: ["@storybook/addon-essentials" ],
  framework: {
    name: "@osucad/storybook-vite",
    options: {
      builder: {
        viteConfigPath: "vite.config.ts",
      },
    },
  },
};

export default config;
