import type { Beatmap, BeatmapPostProcessor } from "@osucad/core";
import type { OsuHitObject } from "./hitObjects/OsuHitObject";
import { calculateStacking } from "./stacking";

export class BeatmapStackingProcessor implements BeatmapPostProcessor
{
  applyToBeatmap(beatmap: Beatmap)
  {
    calculateStacking(
        beatmap.hitObjects as OsuHitObject[],
        beatmap.beatmapInfo.stackLeniency,
        3,
        0,
        beatmap.hitObjects.length - 1,
    );
  }
}
