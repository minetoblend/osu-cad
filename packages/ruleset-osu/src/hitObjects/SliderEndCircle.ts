import type { BeatmapDifficultyInfo, ControlPointInfo } from '@osucad/common';
import type { Slider } from './Slider';
import { HitCircle } from './HitCircle';

export class SliderEndCircle extends HitCircle {
  repeatIndex = 0;

  constructor(readonly slider: Slider) {
    super();
  }

  get spanDuration() {
    return this.slider.spanDuration;
  }

  protected override applyDefaultsToSelf(controlPointInfo: ControlPointInfo, difficulty: BeatmapDifficultyInfo) {
    super.applyDefaultsToSelf(controlPointInfo, difficulty);

    if (this.repeatIndex !== 0) {
      this.timeFadeIn = 0;

      this.timePreempt = this.spanDuration * 2;
    }
    else {
      this.timePreempt += this.startTime - this.slider.startTime;
    }
  }
}
