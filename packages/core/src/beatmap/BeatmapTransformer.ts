import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapColors } from './BeatmapColors';
import type { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import type { BeatmapMetadata } from './BeatmapMetadata';
import type { HitObjectList } from './HitObjectList';
import type { IBeatmap } from './IBeatmap';
import { Component } from '@osucad/framework';

export abstract class BeatmapTransformer<T extends IBeatmap = IBeatmap> extends Component implements IBeatmap {
  abstract readonly beatmap: T;

  get beatmapInfo() {
    return this.beatmap.beatmapInfo;
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

  clone(): IBeatmap<HitObject> {
    throw new Error('BeatmapTransformer cannot be cloned');
  }
}
