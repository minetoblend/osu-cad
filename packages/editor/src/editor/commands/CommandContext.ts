import type { EditorBeatmap } from '../EditorBeatmap.ts';

export class CommandContext {
  constructor(
    readonly beatmap: EditorBeatmap,
    readonly isLocal = true,
  ) {
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }

  get controlPoints() {
    return this.beatmap.controlPoints;
  }
}
