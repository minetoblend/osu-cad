import nx from "@nx/eslint-plugin";

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
      "ignores": [
        "**/dist",
        "**/vite.config.*.timestamp*",
        "**/vitest.config.*.timestamp*"
      ]
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx"
    ],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [
            "^.*/eslint(\\.base)?\\.config\\.[cm]?js$"
          ],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: [
                "*"
              ]
            }
          ]
        }
      ]
    }
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
      "**/*.mjs"
    ],
    // Override or add rules here
    rules: {
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-this-alias": "off",
      "ts/no-redeclare": "off"
    }
  }
];
