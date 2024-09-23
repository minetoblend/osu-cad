import type { Transformable } from './Transformable.ts';
import { Usable } from '../../types/IUsable.ts';
import { almostEquals } from '../../utils';

export class AbsoluteSequenceSender extends Usable {
  constructor(
    readonly sender: Transformable,
    readonly oldTransformDelay: number,
    readonly newTransformDelay: number,
  ) {
    super();
  }

  dispose(): void {
    if (!almostEquals(this.newTransformDelay, this.sender.transformDelay)) {
      throw new Error(
        'transformStartTime at the end of absolute sequence is not the same as at the beginning, but should be. '
        + `(begin=${this.newTransformDelay} end=${this.sender.transformDelay})`,
      );
    }

    this.sender.transformDelay = this.oldTransformDelay;
  }
}
