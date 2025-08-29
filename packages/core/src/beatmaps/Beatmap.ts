import type { HitObject } from "../rulesets/hitObjects/HitObject";
import { BeatmapColors } from "./BeatmapColors";
import { BeatmapDifficultyInfo } from "./BeatmapDifficultyInfo";
import { BeatmapInfo } from "./BeatmapInfo";
import { BeatmapMetadata } from "./BeatmapMetadata";
import { LegacyBeatmapTiming } from "./timing/LegacyBeatmapTiming";

export class Beatmap<T extends HitObject = HitObject>
{
  public constructor(
    public beatmapInfo: BeatmapInfo = new BeatmapInfo(),
    public hitObjects: T[] = [],
    public colors = new BeatmapColors(),
    public readonly timing = new LegacyBeatmapTiming(),
    public readonly metadata = new BeatmapMetadata(),
    public readonly difficulty = new BeatmapDifficultyInfo(),
  )
  {
  }
}
