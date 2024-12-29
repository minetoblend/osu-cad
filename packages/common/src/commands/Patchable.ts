import type { CommandContext } from './CommandContext';

export interface Patchable<TPatch extends object> {
  applyPatch(patch: Partial<TPatch>, ctx: CommandContext): void;

  asPatch(): TPatch;
}
