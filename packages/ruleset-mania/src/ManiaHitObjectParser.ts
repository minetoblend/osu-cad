import type { Beatmap } from '@osucad/common';
import type { ManiaHitObject } from './objects/ManiaHitObject';
import { StableHitObjectParser } from '@osucad/common';

export class ManiaHitObjectParser extends StableHitObjectParser<ManiaHitObject> {
  constructor(beatmap: Beatmap<ManiaHitObject>) {
    super(beatmap);
  }

  override parseHitObject(line: string): ManiaHitObject {

  }

  override encodeHitObject(hitObject: ManiaHitObject): string {

  }
}
