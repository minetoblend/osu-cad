import { BeatmapSettings } from './BeatmapSettings';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import { BeatmapColors } from './BeatmapColors';
import { BeatmapMetadata } from './BeatmapMetadata';
import { ControlPointInfo } from './timing/ControlPointInfo';
import { HitObjectList } from './hitObjects/HitObjectList';

export class Beatmap {
  readonly settings = new BeatmapSettings();
  readonly metadata = new BeatmapMetadata();
  readonly difficulty = new BeatmapDifficultyInfo();
  readonly colors = new BeatmapColors();
  readonly controlPoints = new ControlPointInfo();
  readonly hitObjects = new HitObjectList(this);
}
