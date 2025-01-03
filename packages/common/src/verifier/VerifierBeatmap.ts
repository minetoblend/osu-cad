import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { BeatmapSettings } from '../beatmap/BeatmapSettings';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapVerifier } from './BeatmapVerifier';

export class VerifierBeatmap<T extends HitObject = HitObject> implements IBeatmap<T> {
  constructor(
    readonly beatmap: IBeatmap<T>,
    readonly verifier: BeatmapVerifier<T>,
  ) {
  }

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

  get hitObjects() {
    return this.beatmap.hitObjects;
  }
}
