import type { IBeatmap } from '../../beatmap/IBeatmap.ts';

export class CommandContext {
  constructor(
    readonly beatmap: IBeatmap,
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
