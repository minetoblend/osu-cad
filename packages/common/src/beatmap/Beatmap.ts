import type { AbstractCrdt } from '../crdt/AbstractCrdt';
import type { IBeatmap } from './IBeatmap';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { StaticCrdt } from '../crdt/StaticCrdt';
import { BeatmapColors } from './BeatmapColors';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import { BeatmapMetadata } from './BeatmapMetadata';
import { BeatmapSettings } from './BeatmapSettings';
import { HitObjectList } from './HitObjectList';
import { BeatmapSerializer } from './serialization/BeatmapSerializer';

export class Beatmap extends StaticCrdt implements IBeatmap {
  static get serializer() {
    return new BeatmapSerializer();
  }

  constructor(
    readonly metadata = new BeatmapMetadata(),
    readonly difficulty = new BeatmapDifficultyInfo(),
    readonly settings = new BeatmapSettings(),
    readonly colors = new BeatmapColors(),
    readonly controlPoints = new ControlPointInfo(),
  ) {
    super();
    this.controlPoints.anyPointChanged.addListener(controlPoint =>
      this.hitObjects.invalidateFromControlPoint(controlPoint),
    );
    this.difficulty.invalidated.addListener(() => this.hitObjects.invalidateAll());
  }

  readonly hitObjects = new HitObjectList(this);

  getMaxCombo(): number {
    // TODO
    return 0;
  }

  override get childObjects(): readonly AbstractCrdt<any>[] {
    return [
      this.hitObjects,
      this.controlPoints,
    ];
  }
}
