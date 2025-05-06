import type {
  BuilderOptions,
  StorybookConfig as StorybookConfigBase,
  StorybookConfigVite,
  TypescriptOptions as TypescriptOptionsBuilder,
} from "../../storybook-preset-vite/src/types";

type FrameworkName = "@osucad/storybook-vite";
type BuilderName = "@storybook/builder-vite";

export type FrameworkOptions = {
  builder?: BuilderOptions;
};

type StorybookConfigFramework = {
  framework:
      | FrameworkName
      | {
        name: FrameworkName;
        options: FrameworkOptions;
      };
  frameworkPath?: string;
  core?: StorybookConfigBase["core"] & {
    builder?:
        | BuilderName
        | {
          name: BuilderName;
          options: BuilderOptions;
        };
  };
  typescript?: Partial<TypescriptOptionsBuilder> &
      StorybookConfigBase["typescript"];
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<
  StorybookConfigBase,
    keyof StorybookConfigVite | keyof StorybookConfigFramework
> &
    StorybookConfigVite &
    StorybookConfigFramework;
