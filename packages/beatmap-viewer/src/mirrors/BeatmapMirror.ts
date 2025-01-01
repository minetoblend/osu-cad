import type { WorkingBeatmapSet } from '@osucad/common';

export abstract class BeatmapMirror {
  constructor(readonly name: string) {
  }

  abstract loadBeatmapSet(id: number): Promise<WorkingBeatmapSet>;
}

