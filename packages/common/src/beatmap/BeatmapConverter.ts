import type { HitObject } from '../hitObjects/HitObject';
import type { Ruleset } from '../rulesets/Ruleset';
import type { IBeatmap } from './IBeatmap';
import { Beatmap } from './Beatmap';

export abstract class BeatmapConverter<T extends HitObject> {
  protected constructor(readonly beatmap: IBeatmap, ruleset: Ruleset) {
  }

  abstract canConvert(): boolean;

  convert() {
    const original = this.beatmap.clone();

    return this.convertBeatmap(original);
  }

  protected convertBeatmap(original: IBeatmap): IBeatmap<T> {
    const beatmap = this.createBeatmap();

    // TODO: do a deep clone
    beatmap.metadata = original.metadata;
    beatmap.difficulty = original.difficulty;
    beatmap.beatmapInfo = original.beatmapInfo;
    beatmap.colors = original.colors;
    beatmap.controlPoints = original.controlPoints;
    beatmap.hitObjects = [...this.#convertHitObjects(original.hitObjects, original)].toSorted((a, b) => a.startTime - b.startTime);

    return beatmap;
  }

  protected createBeatmap(): IBeatmap<T> {
    return new Beatmap();
  }

  * #convertHitObjects(hitObjects: readonly HitObject[], original: IBeatmap): Generator<T, void, undefined> {
    for (const hitObject of hitObjects)
      yield * this.convertHitObject(hitObject, original);
  }

  protected abstract convertHitObject(hitObject: HitObject, original: IBeatmap): Generator<T, void, undefined>;
}
