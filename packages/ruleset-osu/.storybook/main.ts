import type { StorybookConfig } from "@osucad/storybook-vite";


const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx))",
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
