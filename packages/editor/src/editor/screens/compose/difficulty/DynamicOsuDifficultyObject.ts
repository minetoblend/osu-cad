import type { HitObjectList } from '../../../../beatmap/hitObjects/HitObjectList';
import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { Action } from 'osucad-framework';
import { OsuDifficultyHitObject } from '../../../../difficulty/preprocessing/OsuDifficultyHitObject';

export class DifficultyObjectList {
  constructor(readonly hitObjects: HitObjectList) {
  }

  difficultyHitObjects: OsuDifficultyHitObject[] = [];

  get(index: number): OsuDifficultyHitObject | null {
    if (index < 1 || index >= this.hitObjects.length)
      return null;

    if (this.difficultyHitObjects[index])
      return this.difficultyHitObjects[index];

    const hitObject = this.hitObjects.get(index)!;

    const lastObject = this.hitObjects.get(index - 1)!;
    const lastLastObject = this.hitObjects.get(index - 2) ?? null;

    const difficultyHitObject = new DynamicOsuDifficultyObject(hitObject, lastObject, lastLastObject, index, this);

    this.difficultyHitObjects[index] = difficultyHitObject;
    this.#lookupMap.set(hitObject, difficultyHitObject);

    return difficultyHitObject;
  }

  #lookupMap = new Map<OsuHitObject, OsuDifficultyHitObject>();

  fromHitObject(hitObject: OsuHitObject) {
    const cached = this.#lookupMap.get(hitObject);
    if (cached)
      return cached;

    return this.get(this.hitObjects.items.indexOf(hitObject));
  }

  invalidated = new Action();

  invalidate() {
    this.difficultyHitObjects = [];
    this.#lookupMap.clear();

    for (const hitObject of this.hitObjects.items) {
      hitObject.lazyTravelTime = null;
      hitObject.lazyEndPosition = null;
      hitObject.lazyTravelDistance = 0;
      hitObject.lazyTravelPath = null;
    }

    this.invalidated.emit();
  }
}

export class DynamicOsuDifficultyObject extends OsuDifficultyHitObject {
  constructor(hitObject: OsuHitObject, lastObject: OsuHitObject, lastLastObject: OsuHitObject | null, index: number, hitObjects: DifficultyObjectList) {
    super(hitObject, lastObject!, lastLastObject, 1, [], index);

    this.#hitObjects = hitObjects;
  }

  #hitObjects!: DifficultyObjectList;

  override previous(backwardsIndex: number): OsuDifficultyHitObject | null {
    const index = this.index - (backwardsIndex + 1);
    return this.#hitObjects.get(index);
  }

  override next(forwardsIndex: number): OsuDifficultyHitObject | null {
    const index = this.index + (forwardsIndex + 1);
    return this.#hitObjects.get(index);
  }
}
