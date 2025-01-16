import type { WorkingBeatmapSet } from '@osucad/core';

export abstract class BeatmapMirror {
  constructor(readonly name: string) {
  }

  abstract loadBeatmapSet(id: number): Promise<WorkingBeatmapSet>;
}
