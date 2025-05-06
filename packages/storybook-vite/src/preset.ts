import path from "path";
import type { PresetProperty, PresetPropertyFn } from "@storybook/types";
import type { StorybookConfig } from "./types";

export const addons: PresetProperty<"addons", StorybookConfig> = [
  path.dirname(
      require.resolve(
          path.join("@osucad/storybook-preset-vite", "package.json"),
      ),
  ).replaceAll("\\", "/"),
  path.dirname(
      require.resolve(
          path.normalize(path.join("@osucad/storybook-renderer", "package.json")),
      ),
  ).replaceAll("\\", "/"),
];

export const core: PresetPropertyFn<"core", StorybookConfig> = async (
  config,
  options,
) =>
{
  const framework = await options.presets.apply<StorybookConfig["framework"]>(
      "framework",
  );

  return {
    ...config,
    builder: {
      name: path.dirname(
          require.resolve(path.join("@storybook/builder-vite", "package.json")),
      ) as "@storybook/builder-vite",
      options:
          typeof framework === "string" ? {} : framework.options.builder || {},
    },
  };
};
