import { BeatmapInfo } from './BeatmapInfo';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import { BeatmapColors } from './BeatmapColors';

export class Beatmap {
  readonly beatmapInfo = new BeatmapInfo();
  readonly difficulty = new BeatmapDifficultyInfo();
  readonly colors = new BeatmapColors();
}
