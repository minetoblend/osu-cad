import type { CommandContext } from './CommandContext';
import type { CommandSource } from './CommandSource';

export abstract class EditorCommand {
  abstract apply(ctx: CommandContext, source: CommandSource): void;

  abstract createUndo(ctx: CommandContext): EditorCommand | null;

  mergeWith(ctx: CommandContext, other: EditorCommand): EditorCommand | null {
    return null;
  }

  version: number = 0;

  isRedundant(ctx: CommandContext) {
    return false;
  }

  get mergeKey(): string | null {
    return null;
  }
}
