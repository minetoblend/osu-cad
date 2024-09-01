import { FillMode, dependencyLoader } from 'osucad-framework';
import type { Spinner } from '../../beatmap/hitObjects/Spinner';
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
