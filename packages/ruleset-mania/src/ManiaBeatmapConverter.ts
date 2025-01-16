import type { HitObject, IBeatmap, Ruleset } from '@osucad/core';
import { BeatmapConverter, hasXPosition } from '@osucad/core';
import { ManiaBeatmap } from './beatmaps/ManiaBeatmap';
import { StageDefinition } from './beatmaps/StageDefinition';
import { ManiaHitObject } from './objects/ManiaHitObject';

export class ManiaBeatmapConverter extends BeatmapConverter<ManiaHitObject> {
  constructor(beatmap: IBeatmap, ruleset: Ruleset) {
    super(beatmap, ruleset);
  }

  override canConvert(): boolean {
    return this.beatmap.hitObjects.items.every(it => hasXPosition(it));
  }

  protected override createBeatmap(): IBeatmap<ManiaHitObject> {
    // TODO
    return new ManiaBeatmap(new StageDefinition(4));
  }

  protected override * convertHitObject(hitObject: HitObject, original: IBeatmap): Generator<ManiaHitObject, void, undefined> {
    if (hitObject instanceof ManiaHitObject) {
      yield hitObject;
    }
  }
}
