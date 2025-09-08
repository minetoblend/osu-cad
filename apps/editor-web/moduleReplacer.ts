import type { Plugin } from "vite";

const replacedModulePrefix = "\0replaced-module:";

export function moduleReplacer(
  modules: Record<string, string>,
): Plugin
{
  return {
    name: "remove-externals",
    apply: "build",
    enforce: "pre",
    resolveId: (source, importer) =>
    {
      if (source in modules)
        return `${replacedModulePrefix}${source}`;
    },
    load: id =>
    {
      if (id.startsWith(replacedModulePrefix))
      {
        return {
          code: modules[id.slice(replacedModulePrefix.length)],
        };
      }
    },
  };
}
