import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapColors } from './BeatmapColors';
import type { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import type { BeatmapMetadata } from './BeatmapMetadata';
import type { BeatmapSettings } from './BeatmapSettings';
import type { HitObjectList } from './HitObjectList';
import { injectionToken } from 'osucad-framework';

export interface IBeatmap<T extends HitObject = HitObject> {
  readonly settings: BeatmapSettings;
  readonly metadata: BeatmapMetadata;
  readonly difficulty: BeatmapDifficultyInfo;
  readonly colors: BeatmapColors;
  readonly controlPoints: ControlPointInfo;
  readonly hitObjects: HitObjectList<T>;
}

// eslint-disable-next-line ts/no-redeclare
export const IBeatmap = injectionToken<IBeatmap>();
