import { PlayfieldAdjustmentContainer } from '@osucad/core';
import { Anchor } from '@osucad/framework';

export class ManiaPlayfieldAdjustmentContainer extends PlayfieldAdjustmentContainer {
  constructor() {
    super();

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }
}
