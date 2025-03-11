import { OsucadScreen } from '@osucad/core';
import { Anchor } from '@osucad/framework';
import { Countdown } from './Countdown';

export class PlaceEditor extends OsucadScreen {
  constructor() {
    super();

    this.addInternal(new Countdown().with({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      // x: -100,
      // y: -100,
    }));
  }
}
