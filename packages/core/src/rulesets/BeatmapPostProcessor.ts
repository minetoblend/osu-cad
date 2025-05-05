import { Beatmap } from "../beatmaps/Beatmap";

export interface BeatmapPostProcessor 
{
  applyToBeatmap(beatmap: Beatmap): void;
}
