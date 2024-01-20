import {Beatmap, HitObjectManager} from "../osu";
import {EditorCommand} from "./commands";

export class CommandContext {

  get hitObjects(): HitObjectManager {
    return this.beatmap.hitObjects;
  }

  constructor(
    readonly beatmap: Beatmap,
    readonly local: boolean,
    readonly own: boolean,
    readonly version: number,
  ) {
  }
}

type UndoType = "undo" | "redo";

export interface CommandHandler<T> {
  apply(command: T, context: CommandContext): void;

  canBeIgnored?(command: T, context: CommandContext): boolean;

  createUndo?(command: T, context: CommandContext, type: UndoType): EditorCommand | undefined;

  merge?(a: T, b: T, context: CommandContext): EditorCommand | undefined;
}

