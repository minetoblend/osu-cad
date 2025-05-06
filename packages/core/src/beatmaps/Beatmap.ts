import type { HitObject } from "../rulesets/hitObjects/HitObject";
import { BeatmapColors } from "./BeatmapColors";
import { BeatmapInfo } from "./BeatmapInfo";
import { LegacyBeatmapTiming } from "./timing/LegacyBeatmapTiming";

export class Beatmap<T extends HitObject = HitObject>
{
  constructor(
    public beatmapInfo: BeatmapInfo = new BeatmapInfo(),
    public hitObjects: T[] = [],
    public colors = new BeatmapColors(),
    readonly timing = new LegacyBeatmapTiming(),
  )
  {
  }

  get metadata()
  {
    return this.beatmapInfo.metadata;
  }

  get difficulty()
  {
    return this.beatmapInfo.difficulty;
  }
}
