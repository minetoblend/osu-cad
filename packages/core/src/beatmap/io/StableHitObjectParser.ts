import type { HitObject } from '../../hitObjects/HitObject';
import type { Beatmap } from '../Beatmap';

export abstract class StableHitObjectParser<T extends HitObject> {
  protected constructor(readonly beatmap: Beatmap<T>) {
  }

  abstract parseHitObject(line: string): T;

  abstract encodeHitObject(hitObject: T): string;
}
