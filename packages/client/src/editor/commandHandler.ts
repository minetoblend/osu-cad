import {BeatmapManager} from "./beatmapManager.ts";
import {
  CommandContext,
  decodeCommands,
  EditorCommand,
  encodeCommands,
  getCommandHandler,
  VersionedEditorCommand,
} from "@osucad/common";
import {EditorSocket} from "@/editor/editorSocket.ts";

export class CommandManager {

  private sessionId: number = 0;
  readonly history = new History(this);

  constructor(
    private readonly beatmapManager: BeatmapManager,
    private readonly socket: EditorSocket,
  ) {
    socket.on("roomState", ({ownUser}) => {
      this.sessionId = ownUser.sessionId;
    });
    socket.on("commands", (commands: Uint8Array, sessionId: number) => {

      const decoded = decodeCommands(commands);
      for (const command of decoded)
        this.onCommandReceived(command, sessionId);
    });

    addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        const context = new CommandContext(this.beatmapManager.beatmap, true, true, 0);
        this.history.undo(context);
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        const context = new CommandContext(this.beatmapManager.beatmap, true, true, 0);
        this.history.redo(context);
      }
    });
    setInterval(() => {
      if (this.commandBuffer.length === 0)
        return;
      const commands = this.commandBuffer;
      this.commandBuffer = [];
      this.socket.emit("commands", encodeCommands(commands));
    }, 50);
  }

  submit(command: EditorCommand, recordHistory = true, commit = false) {
    const version = this.nextVersion++;
    const context = new CommandContext(this.beatmapManager.beatmap, true, true, version);

    if (recordHistory)
      this.history.record(command, context);
    if (this.handle(command, context)) {
      this.addToBuffer(command, version);
    }
    if (commit)
      this.history.commit();
  }

  commandBuffer: VersionedEditorCommand[] = [];

  private addToBuffer(command: EditorCommand, version: number) {
    const handler = getCommandHandler(command);
    const context = new CommandContext(this.beatmapManager.beatmap, true, true, 0);

    if (handler.merge)
      for (let i = 0; i < this.commandBuffer.length; i++) {
        if (this.commandBuffer[i].command.type !== command.type)
          continue;
        const merged = handler.merge(this.commandBuffer[i].command, command, context);
        if (merged) {
          this.commandBuffer.splice(i, 1);
          command = merged;
          break;
        }
      }
    this.commandBuffer.push({command, version});
  }

  private nextVersion = 0;

  private handle(command: EditorCommand, context: CommandContext) {
    const handler = getCommandHandler(command);
    if (handler.canBeIgnored?.(command, context))
      return false;

    handler.apply(command, context);
    return true;
  }

  private onCommandReceived(command: VersionedEditorCommand, sessionId: number) {
    // console.log("received command", command);
    const isOwn = sessionId === this.sessionId;
    const beatmap = this.beatmapManager.beatmap;
    const context = new CommandContext(beatmap, false, isOwn, command.version);
    this.handle(command.command, context);
  }

  undo() {
    const context = new CommandContext(this.beatmapManager.beatmap, true, true, 0);
    this.history.undo(context);
  }

  redo() {
    const context = new CommandContext(this.beatmapManager.beatmap, true, true, 0);
    this.history.redo(context);
  }

  commit() {
    return this.history.commit();
  }
}

class History {

  constructor(private readonly manager: CommandManager) {
  }

  private transaction: HistoryEntry[] = [];

  private undoStack: HistoryEntry[][] = shallowReactive([]);
  private redoStack: HistoryEntry[][] = shallowReactive([]);

  canUndo = computed(() => this.undoStack.length > 0);
  canRedo = computed(() => this.redoStack.length > 0);

  record(command: EditorCommand, context: CommandContext) {
    const handler = getCommandHandler(command);
    let reverse = handler.createUndo?.(command, context, "undo");

    const mergedIndices = new Set<number>();
    for (let i = this.transaction.length - 1; i >= 0; i--) {
      const entry = this.transaction[i];
      if (entry.command.type !== command.type) continue;

      const merged = handler.merge?.(entry.command, command, context);
      if (merged) {
        command = merged;
        if (reverse && entry.reverse)
          reverse = handler.merge?.(reverse, entry.reverse, context) ?? reverse;

        mergedIndices.add(i);
      }
    }

    if (mergedIndices.size > 0)
      this.transaction = this.transaction.filter((_, i) => !mergedIndices.has(i));

    this.transaction.push({command, reverse});
  }

  commit() {
    if (this.transaction.length === 0) return false;
    this.undoStack.push(this.transaction);
    this.redoStack.splice(0, this.redoStack.length)
    this.transaction = [];
    return true;
  }

  undo(context: CommandContext) {
    if (this.undoStack.length === 0) return;
    const transaction = this.undoStack.pop()!;

    const redoTransaction: HistoryEntry[] = [];

    for (let i = transaction.length - 1; i >= 0; i--) {
      const {reverse: command} = transaction[i];
      if (command) {
        const reverse = getCommandHandler(command).createUndo?.(command, context, "redo");
        this.manager.submit(command, false);
        if (reverse)
          redoTransaction.push({command, reverse});
      }
    }

    if (redoTransaction.length > 0)
      this.redoStack.push(redoTransaction);
  }

  redo(_context: CommandContext) {
    if (this.redoStack.length === 0) return;
    const transaction = this.redoStack.pop()!;

    const undoTransaction: HistoryEntry[] = [];

    for (let i = transaction.length - 1; i >= 0; i--) {
      const {command, reverse} = transaction[i];
      if (reverse) {
        this.manager.submit(reverse, false);
        undoTransaction.push({command: reverse, reverse: command});
      }
    }

    if (undoTransaction.length > 0)
      this.undoStack.push(undoTransaction);
  }

}

interface HistoryEntry {
  command: EditorCommand;
  reverse?: EditorCommand;
}