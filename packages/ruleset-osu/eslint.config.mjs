// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import baseConfig from "../../eslint.config.mjs";

export default [...baseConfig, {
  "files": [
    "**/*.json",
  ],
  "rules": {
  },
  "languageOptions": {
    "parser": (await import("jsonc-eslint-parser")),
  },
}, ...storybook.configs["flat/recommended"]];
