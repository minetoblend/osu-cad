import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    "files": [
      "**/*.json",
    ],
    "languageOptions": {
      "parser": (await import("jsonc-eslint-parser")),
    },
  },
  {
    "files": [
      "**/package.json",
      "**/package.json",
      "**/executors.json",
    ],
    "rules": {
      "@nx/nx-plugin-checks": "error",
    },
    "languageOptions": {
      "parser": (await import("jsonc-eslint-parser")),
    },
  },
];
