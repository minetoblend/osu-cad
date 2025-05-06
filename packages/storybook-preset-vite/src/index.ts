import type { StorybookConfigVite } from "./types";

export * from "./types";

export const vite: StorybookConfigVite["viteFinal"] = (config) =>
{
  return config;
};
