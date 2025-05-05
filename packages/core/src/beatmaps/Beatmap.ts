import { HitObject } from "../rulesets/hitObjects/HitObject";
import { BeatmapColors } from "./BeatmapColors";
import { BeatmapInfo } from "./BeatmapInfo";

export class Beatmap<T extends HitObject = HitObject> 
{
  constructor(
    public beatmapInfo: BeatmapInfo = new BeatmapInfo(),
    public hitObjects: T[] = [],
    public colors = new BeatmapColors(),
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
