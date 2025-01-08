import type { HitObject, IBeatmap, Ruleset } from '@osucad/common';
import { BeatmapConverter, hasXPosition } from '@osucad/common';
import { ManiaBeatmap } from './beatmaps/ManiaBeatmap';
import { ManiaHitObject } from './objects/ManiaHitObject';

export class ManiaBeatmapConverter extends BeatmapConverter<ManiaHitObject> {
  constructor(beatmap: IBeatmap, ruleset: Ruleset) {
    super(beatmap, ruleset);

    IsForCurrentRuleset = difficulty.SourceRuleset.Equals(ruleset.RulesetInfo);
  }

  override canConvert(): boolean {
    return this.beatmap.hitObjects.every(it => hasXPosition(it));
  }

  protected override createBeatmap(): IBeatmap<ManiaHitObject> {
    return new ManiaBeatmap();
  }

  protected override * convertHitObject(hitObject: HitObject, original: IBeatmap): Generator<ManiaHitObject, void, undefined> {
    if (hitObject instanceof ManiaHitObject) {
      yield hitObject;
    }
  }
}
