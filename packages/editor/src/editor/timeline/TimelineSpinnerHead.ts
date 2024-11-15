import type { Spinner } from '@osucad/common';
import { dependencyLoader, FillMode } from 'osucad-framework';
import { TimelineComboNumber } from './TimelineComboNumber';
import { TimelineElement } from './TimelineElement';

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
