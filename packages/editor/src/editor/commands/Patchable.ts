import type { CommandContext } from './CommandContext.ts';

export interface Patchable<TPatch extends object> {
  applyPatch(patch: Partial<TPatch>, ctx: CommandContext): void;

  asPatch(): TPatch;
}
