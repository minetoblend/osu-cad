import { FillMode, dependencyLoader } from 'osucad-framework';
import type { Slider } from '@osucad/common';
import { TimelineElement } from './TimelineElement';
import { TimelineComboNumber } from './TimelineComboNumber';

export class TimelineSliderHead extends TimelineElement {
  constructor(readonly hitObject: Slider) {
    super({
      bodyColor: hitObject.comboColor,
      fillMode: FillMode.Fit,
    });
  }

  @dependencyLoader()
  load() {
    this.addInternal(
      new TimelineComboNumber(this.hitObject),
    );
  }

  onHover(): boolean {
    this.applyState();
    return true;
  }

  onHoverLost(): boolean {
    this.applyState();
    return true;
  }

  protected applyState() {
    this.overlay.alpha = (this.isHovered || this.isDragged) ? 0.25 : 0;
  }
}
