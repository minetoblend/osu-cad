import { Beatmap, BeatmapPostProcessor } from "@osucad/core";
import { BeatmapComboProcessor } from "./BeatmapComboProcessor";
import { BeatmapStackingProcessor } from "./BeatmapStackingProcessor";

export class OsuBeatmapPostProcessor implements BeatmapPostProcessor 
{
  public applyToBeatmap(beatmap: Beatmap) 
  {
    new BeatmapComboProcessor().applyToBeatmap(beatmap);
    new BeatmapStackingProcessor().applyToBeatmap(beatmap);
  }
}
