import type { Beatmap } from "../beatmaps/Beatmap";

export interface BeatmapPostProcessor 
{
  applyToBeatmap(beatmap: Beatmap): void;
}
