import type { HitObject } from '../hitObjects/HitObject';
import type { IHasComboInformation } from '../hitObjects/IHasComboInformation';
import { TimestampFormatter } from '../editor/TimestampFormatter';

export class HitObjectTimestamp {
  constructor(readonly hitObjects: (HitObject & IHasComboInformation)[]) {
  }

  toString() {
    return `${TimestampFormatter.formatTimestamp(this.hitObjects[0].startTime)} (${this.hitObjects.map(it => it.indexInCombo + 1).join(', ')})`;
  }
}
