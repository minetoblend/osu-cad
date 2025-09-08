import { join } from "node:path";
import type { TsgoExecutorSchema } from "./schema";

export function normalizeOptions(
  options: TsgoExecutorSchema,
  contextRoot: string,
  sourceRoot: string,
  projectRoot: string,
)
{
  const outputPath = join(contextRoot, options.outputPath);
  const rootDir = options.rootDir
      ? join(contextRoot, options.rootDir)
      : join(contextRoot, projectRoot);

  const emitDeclarationOnly = options.emitDeclarationOnly ?? false;

  return {
    ...options,
    root: contextRoot,
    projectRoot,
    outputPath,
    sourceRoot,
    rootDir,
    emitDeclarationOnly,
  };
}

export type NormalizedOptions = ReturnType<typeof normalizeOptions>;
