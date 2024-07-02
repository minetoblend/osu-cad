import { CommandContext } from './CommandContext';
import type { IEditorCommand } from './IEditorCommand';

export abstract class CommandHandler<T extends IEditorCommand> {
  abstract get command(): string;

  abstract apply(
    ctx: CommandContext,
    command: T,
    source: 'local' | 'remote',
  ): void;

  acknowledge(ctx: CommandContext, command: T): void {}

  abstract createUndoCommand(
    ctx: CommandContext,
    command: T,
  ): IEditorCommand | null;

  canBeIgnored(ctx: CommandContext, command: T): boolean {
    return false;
  }

  merge(ctx: CommandContext, current: T, other: T): IEditorCommand | null {
    return null;
  }
}
