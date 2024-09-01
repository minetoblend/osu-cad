import type { Beatmap } from '../../beatmap/Beatmap';

export class CommandContext {
  constructor(
    readonly beatmap: Beatmap,
    readonly isLocal = true,
  ) {
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }
}
