import { CommandContext } from './CommandContext';
import type { IEditorCommand } from './IEditorCommand';

export abstract class CommandHandler<T extends IEditorCommand, TResult = void> {
  abstract get command(): string;

  abstract apply(
    ctx: CommandContext,
    command: T,
    source: 'local' | 'remote',
  ): TResult;

  acknowledge(ctx: CommandContext, command: T): void {}

  abstract createUndoCommand(
    ctx: CommandContext,
    command: T,
  ): IEditorCommand | null;

  canBeIgnored(ctx: CommandContext, command: T): boolean {
    return false;
  }

  getMergeKey(command: T): string | null {
    return null;
  }

  merge(ctx: CommandContext, current: T, other: T): IEditorCommand | null {
    return null;
  }
}
