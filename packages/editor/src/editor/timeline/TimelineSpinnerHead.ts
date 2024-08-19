import type { Spinner } from '@osucad/common';
import { FillMode, dependencyLoader } from 'osucad-framework';
import { TimelineElement } from './TimelineElement';
import { TimelineComboNumber } from './TimelineComboNumber';

export class TimelineSpinnerHead extends TimelineElement {
  constructor(readonly hitObject: Spinner) {
    super({
      bodyColor: hitObject.comboColor,
      fillMode: FillMode.Fit,
    });
  }

  @dependencyLoader()
  load() {
    this.addInternal(new TimelineComboNumber(this.hitObject));
  }
}
