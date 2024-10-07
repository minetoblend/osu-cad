import type { BeatmapColors } from './BeatmapColors.ts';
import type { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo.ts';
import type { BeatmapMetadata } from './BeatmapMetadata.ts';
import type { BeatmapSettings } from './BeatmapSettings.ts';
import type { HitObjectList } from './hitObjects/HitObjectList.ts';
import type { ControlPointInfo } from './timing/ControlPointInfo.ts';
import { injectionToken } from 'osucad-framework';

export interface IBeatmap {
  readonly settings: BeatmapSettings;
  readonly metadata: BeatmapMetadata;
  readonly difficulty: BeatmapDifficultyInfo;
  readonly colors: BeatmapColors;
  readonly controlPoints: ControlPointInfo;
  readonly hitObjects: HitObjectList;
}

// eslint-disable-next-line ts/no-redeclare
export const IBeatmap = injectionToken<IBeatmap>();
