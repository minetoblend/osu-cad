import type { WorkingBeatmapSet } from '../beatmap/workingBeatmap/WorkingBeatmapSet';
import type { BeatmapVerifier } from './BeatmapVerifier';

export class VerifierBeatmapSet {
  constructor(
    readonly beatmapSet: WorkingBeatmapSet,
    readonly verifier: BeatmapVerifier,
  ) {
  }
}
