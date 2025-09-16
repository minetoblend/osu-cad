import baseConfig from "../../eslint.config.mjs";
import { globalIgnores } from "eslint/config";

export default [
  ...baseConfig,
  globalIgnores([
    "./plugin.d.ts",
    "./plugin.js",
  ]),
  {
    "files": [
      "**/*.json",
    ],
    "rules": {
    },
    "languageOptions": {
      "parser": (await import("jsonc-eslint-parser")),
    },
  },
];
