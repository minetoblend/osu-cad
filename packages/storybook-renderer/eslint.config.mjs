import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    "files": [
      "**/*.json",
    ],
    "rules": {
      "@nx/dependency-checks": [
        "error",
        {
          "ignoredFiles": [
            "{projectRoot}/eslint.config.{js,cjs,mjs}",
            "{projectRoot}/tsup.config.ts",
          ],
        },
      ],
    },
    "languageOptions": {
      "parser": (await import("jsonc-eslint-parser")),
    },
  },
];
