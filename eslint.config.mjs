import nx from "@nx/eslint-plugin";
import { defineConfig } from "eslint/config";
import stylisticTs from "@stylistic/eslint-plugin-ts";

export default defineConfig([
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    "ignores": [
      "**/dist",
      "**/vite.config.*.timestamp*",
      "**/vitest.config.*.timestamp*",
    ],
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
    ],
    rules: {
      "@nx/dependency-checks": "off",
      "@nx/enforce-module-boundaries": "off",
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],
    plugins: {
      "@stylistic": stylisticTs,
    },
    rules: {
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "none",
      }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/consistent-type-imports": ["error", {
        disallowTypeAnnotations: false,
      }],
      "@typescript-eslint/explicit-member-accessibility": "error",
      "ts/no-redeclare": "off",
      "eol-last": ["error", "always"],
      "no-tabs": ["error"],
      "nonblock-statement-body-position": ["error", "below"],
      "no-mixed-operators": ["error", {
        groups: [
          ["&&", "||"],
        ],
      }],
      "no-trailing-spaces": "error",
      "no-multi-spaces": "error",
      "@stylistic/indent": ["error", 2, {
        ignoredNodes: ["ConditionalExpression"],
        offsetTernaryExpressions: true,
        CallExpression: { "arguments": 2 },
      }],
      "@stylistic/quotes": ["error", "double", {
        avoidEscape: true,
      }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/brace-style": ["error", "allman"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/function-call-spacing": ["error", "never"],
      "@stylistic/type-annotation-spacing": ["error", {
        "before": false,
        "after": true,
        "overrides": { "arrow": { "before": true, "after": true } },
      }],
      "no-unused-private-class-members": "off",
    },
  },
]);
