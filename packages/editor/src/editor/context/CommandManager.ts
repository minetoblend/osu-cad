import type { EditorCommand } from '../commands/EditorCommand';
import type { EditorBeatmap } from '../EditorBeatmap';
import { Action, Bindable } from 'osucad-framework';
import { CommandContext } from '../commands/CommandContext';
import { CommandSource } from '../commands/CommandSource';

export class CommandManager {
  constructor(
    readonly beatmap: EditorBeatmap,
  ) {
  }

  readonly canUndo = new Bindable(false);

  readonly canRedo = new Bindable(false);

  readonly commandApplied = new Action<EditorCommand>();

  hasUnsavedChanges = false;

  createContext(): CommandContext {
    return new CommandContext(this.beatmap);
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

  protected beforeCommandSubmit(command: EditorCommand): boolean {
    return true;
  }

  protected afterCommandSubmit(command: EditorCommand) {
    this.hasUnsavedChanges = true;
  }

  protected afterCommandApplied(command: EditorCommand) {
    this.commandApplied.emit(command);
  }

  #commandVersion = 0;

  submit(
    command: EditorCommand,
    commit = true,
  ) {
    console.debug('Command submitted', command);

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

  #submit(
    command: EditorCommand,
    recordHistory = true,
  ) {
    command.version = this.#commandVersion++;
    if (!this.beforeCommandSubmit(command))
      return undefined;

    if (recordHistory) {
      this.#record(command);
    }

    this.#apply(command);
    this.afterCommandSubmit(command);
  }

  #apply(command: EditorCommand) {
    if (command.isRedundant(this.context)) {
      return false;
    }

    command.apply(this.context, CommandSource.Local);

    this.afterCommandApplied(command);
  }

  #transaction: HistoryEntry[] = [];
  #mergeKeys = new Map<string, HistoryEntry>();

  #record(command: EditorCommand) {
    let reverse = command.createUndo(this.context);

    const mergeKey = command.mergeKey;

    if (mergeKey) {
      const mergeWith = this.#mergeKeys.get(mergeKey);

      if (mergeWith) {
        const index = this.#transaction.findIndex(it => it.command === mergeWith.command);

        if (index !== -1) {
          this.#transaction.splice(index, 1);

          command = mergeWith.command.mergeWith(this.context, command) ?? command;

          if (mergeWith.reverse) {
            reverse = reverse?.mergeWith(this.context, mergeWith.reverse) ?? reverse;
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
    if (this.#transaction.length)
      this.#commit();

    if (this.#undoStack.length === 0)
      return false;

    this.beforeUndo.emit();

    const transaction = this.#undoStack.pop()!;

    const redoTransaction: HistoryEntry[] = [];

    for (let i = transaction.length - 1; i >= 0; i--) {
      const { reverse: command } = transaction[i];
      if (command) {
        const reverse = command.createUndo(this.context);
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

    this.beforeRedo.emit();

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

  dispose() {
  }

  beforeUndo = new Action();

  beforeRedo = new Action();
}

interface HistoryEntry {
  command: EditorCommand;
  reverse: EditorCommand | null;
}
