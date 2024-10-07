import type { BeatmapColors } from './BeatmapColors.ts';
import type { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo.ts';
import type { BeatmapMetadata } from './BeatmapMetadata.ts';
import type { BeatmapSettings } from './BeatmapSettings.ts';
import type { HitObjectList } from './hitObjects/HitObjectList.ts';
import type { IBeatmap } from './IBeatmap.ts';
import type { ControlPointInfo } from './timing/ControlPointInfo.ts';
import { Component } from 'osucad-framework';

export abstract class BeatmapTransformer<T extends IBeatmap = IBeatmap> extends Component implements IBeatmap {
  abstract readonly beatmap: T;

  get settings(): BeatmapSettings {
    return this.beatmap.settings;
  }

  get metadata(): BeatmapMetadata {
    return this.beatmap.metadata;
  }

  get difficulty(): BeatmapDifficultyInfo {
    return this.beatmap.difficulty;
  }

  get colors(): BeatmapColors {
    return this.beatmap.colors;
  }

  get controlPoints(): ControlPointInfo {
    return this.beatmap.controlPoints;
  }

  get hitObjects(): HitObjectList {
    return this.beatmap.hitObjects;
  }
}
