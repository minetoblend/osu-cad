import type { AbstractCrdt } from '../crdt/AbstractCrdt';
import type { HitObject } from '../hitObjects/HitObject';
import type { IBeatmap } from './IBeatmap';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { StaticCrdt } from '../crdt/StaticCrdt';
import { RulesetStore } from '../rulesets/RulesetStore';
import { BeatmapColors } from './BeatmapColors';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo';
import { BeatmapMetadata } from './BeatmapMetadata';
import { BeatmapSettings } from './BeatmapSettings';
import { HitObjectList } from './HitObjectList';
import { BeatmapSerializer } from './serialization/BeatmapSerializer';

export class Beatmap<T extends HitObject = HitObject> extends StaticCrdt implements IBeatmap<T> {
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

  readonly hitObjects = new HitObjectList<T>(this);

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

  get ruleset() {
    return RulesetStore.getRuleset(this.settings.mode);
  }
}
