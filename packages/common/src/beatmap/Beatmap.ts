import type { AbstractCrdt } from '../crdt/AbstractCrdt';
import type { HitObject } from '../hitObjects/HitObject';
import type { IBeatmap } from './IBeatmap';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { StaticCrdt } from '../crdt/StaticCrdt';
import { BeatmapColors } from './BeatmapColors';
import { BeatmapInfo } from './BeatmapInfo';
import { HitObjectList } from './HitObjectList';
import { BeatmapSerializer } from './serialization/BeatmapSerializer';

export class Beatmap<T extends HitObject = HitObject> extends StaticCrdt implements IBeatmap<T> {
  static get serializer() {
    return new BeatmapSerializer();
  }

  constructor(
    readonly beatmapInfo: BeatmapInfo = new BeatmapInfo(),
    readonly colors = new BeatmapColors(),
    readonly controlPoints = new ControlPointInfo(),
  ) {
    super();
  }

  readonly hitObjects = new HitObjectList<T>(this);

  get metadata() {
    return this.beatmapInfo.metadata;
  }

  set metadata(value) {
    this.beatmapInfo.metadata = value;
  }

  get difficulty() {
    return this.beatmapInfo.difficulty;
  }

  set difficulty(value) {
    this.beatmapInfo.difficulty = value;
  }

  getMaxCombo(): number {
    // TODO
    return 0;
  }

  preProcess() {
    for (const h of this.hitObjects)
      this.applyDefaultsTo(h);
  }

  applyDefaultsTo(hitObject: HitObject) {
    hitObject.applyDefaults(this.controlPoints, this.difficulty);
  }

  override get childObjects(): readonly AbstractCrdt<any>[] {
    return [
      this.controlPoints,
    ];
  }

  clone(): Beatmap<T> {
    return Object.assign(new Beatmap(), this);
  }
}
