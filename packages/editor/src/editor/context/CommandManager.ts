import type {
  Beatmap,
  CommandHandler,
  IEditorCommand,
} from '@osucad/common';
import {
  CommandContext,
  getCommandHandler,
} from '@osucad/common';
import { Bindable } from 'osucad-framework';
import type { EditorContext } from './EditorContext';

export class CommandManager {
  constructor(
    readonly editorContext: EditorContext,
    readonly beatmap: Beatmap,
  ) {}

  readonly canUndo = new Bindable(false);

  readonly canRedo = new Bindable(false);

  createContext(): CommandContext {
    return new CommandContext(this.beatmap, true);
  }

  #context: CommandContext | null = null;

  protected get context(): CommandContext {
    if (!this.#context) {
      this.#context = this.createContext();
    }

    return this.#context;
  }

  undo(): boolean {
    return this.#undo();
  }

  redo(): boolean {
    return this.#redo();
  }

  undoCurrentTransaction() {
    const transaction = this.#transaction;
    for (const { reverse } of transaction.reverse()) {
      if (!reverse) {
        continue;
      }

      this.#submit(reverse, false);
    }

    this.#transaction.length = 0;
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  protected beforeCommandSubmit(command: IEditorCommand): boolean {
    return true;
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  protected afterCommandSubmit(command: IEditorCommand) {}

  // eslint-disable-next-line unused-imports/no-unused-vars
  protected afterCommandApplied(command: IEditorCommand) {}

  #commandVersion = 0;

  submit<T>(
    command: IEditorCommand<CommandHandler<any, T>>,
    commit = true,
  ): T | undefined {
    const result = this.#submit(command, true);

    if (commit) {
      this.commit();
    }

    return result;
  }

  commit() {
    this.#commit();
    this.#updateCanUndoRedo();
  }

  #submit<T>(
    command: IEditorCommand<CommandHandler<any, T>>,
    recordHistory = true,
  ): T | undefined {
    command.version = this.#commandVersion++;
    if (!this.beforeCommandSubmit(command))
      return undefined;

    if (recordHistory) {
      this.#record(command);
    }

    const result = this.#apply(command);
    this.afterCommandSubmit(command);

    return result;
  }

  #apply<T>(command: IEditorCommand<CommandHandler<any, T>>): T | undefined {
    const handler = getCommandHandler(command);

    if (!handler) {
      console.error(`No handler found for command ${command.type}`);
      return undefined;
    }

    if (handler.canBeIgnored(this.context, command)) {
      return undefined;
    }

    const result = handler.apply(this.context, command, 'local');

    this.afterCommandApplied(command);

    return result;
  }

  #transaction: HistoryEntry[] = [];
  #mergeKeys = new Map<string, HistoryEntry>();

  #record(command: IEditorCommand) {
    const handler = getCommandHandler(command);
    if (!handler)
      return;

    let reverse = handler.createUndoCommand(this.context, command);

    const mergeKey = handler.getMergeKey(command);

    if (mergeKey) {
      const mergeWith = this.#mergeKeys.get(mergeKey);

      if (mergeWith) {
        const index = this.#transaction.findIndex(it => it.command === mergeWith.command);

        if (index !== -1) {
          this.#transaction.splice(index, 1);
          if (mergeWith.reverse) {
            reverse = handler.merge(this.context, mergeWith.reverse, reverse) ?? reverse;
          }
        }
      }

      this.#mergeKeys.set(mergeKey, { command, reverse });
    }

    this.#transaction.push({ command, reverse });
  }

  #undoStack: HistoryEntry[][] = [];
  #redoStack: HistoryEntry[][] = [];

  #undo(): boolean {
    if (this.#undoStack.length === 0)
      return false;
    const transaction = this.#undoStack.pop()!;

    const redoTransaction: HistoryEntry[] = [];

    for (let i = transaction.length - 1; i >= 0; i--) {
      const { reverse: command } = transaction[i];
      if (command) {
        const reverse = getCommandHandler(command)?.createUndoCommand(
          this.context,
          command,
        );
        this.#submit(command, false);
        if (reverse)
          redoTransaction.push({ command, reverse });
      }
    }

    if (redoTransaction.length > 0) {
      this.#redoStack.push(redoTransaction);
    }

    this.#updateCanUndoRedo();

    return true;
  }

  #redo(): boolean {
    if (this.#redoStack.length === 0)
      return false;
    const transaction = this.#redoStack.pop()!;

    const undoTransaction: HistoryEntry[] = [];

    for (let i = transaction.length - 1; i >= 0; i--) {
      const { command, reverse } = transaction[i];
      if (reverse) {
        this.#submit(reverse, false);
        undoTransaction.push({ command: reverse, reverse: command });
      }
    }

    if (undoTransaction.length > 0) {
      this.#undoStack.push(undoTransaction);
    }

    this.#updateCanUndoRedo();

    return true;
  }

  #commit() {
    if (this.#transaction.length === 0) {
      return false;
    }

    this.#undoStack.push(this.#transaction);
    this.#transaction = [];
    this.#mergeKeys.clear();

    this.#redoStack.length = 0;

    return true;
  }

  #updateCanUndoRedo() {
    this.canUndo.value = this.#undoStack.length > 0;
    this.canRedo.value = this.#redoStack.length > 0;
  }

  dispose() {}
}

interface HistoryEntry {
  command: IEditorCommand;
  reverse: IEditorCommand | null;
}
