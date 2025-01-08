import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapColors } from './BeatmapColors';
import type { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import type { BeatmapInfo } from './BeatmapInfo';
import type { BeatmapMetadata } from './BeatmapMetadata';
import type { HitObjectList } from './HitObjectList';
import { injectionToken } from 'osucad-framework';

export interface IBeatmap<T extends HitObject = HitObject> {
  beatmapInfo: BeatmapInfo;
  metadata: BeatmapMetadata;
  difficulty: BeatmapDifficultyInfo;
  colors: BeatmapColors;
  controlPoints: ControlPointInfo;
  hitObjects: HitObjectList<T>;
  clone(): IBeatmap<T>;
}

// eslint-disable-next-line ts/no-redeclare
export const IBeatmap = injectionToken<IBeatmap>();
