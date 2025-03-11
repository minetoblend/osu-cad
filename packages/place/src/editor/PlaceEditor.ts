import { OsucadScreen } from '@osucad/core';
import { TutorialDialog } from '../dialogs/TutorialDialog';

export class PlaceEditor extends OsucadScreen {
  constructor() {
    super();

    this.addInternal(new TutorialDialog());
  }
}
