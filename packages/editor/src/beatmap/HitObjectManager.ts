import type { SortedList } from 'osucad-framework';
import type { HitObject } from '@osucad/common';

export class HitObjectManager {
  constructor(readonly hitObjects: SortedList<HitObject>) {
  }
}
