import { Beatmap } from '../osu';

export class CommandContext {
  constructor(
    readonly beatmap: Beatmap,
    readonly isLocal: boolean = true,
  ) {}

  get isRemote() {
    return !this.isLocal;
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }

  get controlPoints() {
    return this.beatmap.controlPoints;
  }
}
