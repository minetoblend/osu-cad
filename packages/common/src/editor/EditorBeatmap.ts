import type { BeatmapColors, BeatmapDifficultyInfo, BeatmapMetadata, BeatmapSettings, ControlPointInfo, HitObjectList, IBeatmap } from '@osucad/common';
import type { BeatmapAssetManager } from './BeatmapAssetManager';

export abstract class EditorBeatmap implements IBeatmap {
  abstract readonly beatmap: IBeatmap;
  abstract readonly assets: BeatmapAssetManager;

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
