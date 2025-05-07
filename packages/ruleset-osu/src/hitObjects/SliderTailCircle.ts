import { safeAssign, type BeatmapDifficultyInfo, type IBeatmapTiming } from "@osucad/core";
import { HitCircle } from "./HitCircle";
import type { Slider } from "./Slider";
import type { OsuHitObjectOptions } from "./OsuHitObject";

export interface SliderTailOptions extends OsuHitObjectOptions
{
  repeatIndex?: number
}

export class SliderTailCircle extends HitCircle
{
  repeatIndex = 0;

  constructor(readonly slider: Slider, options: SliderTailOptions)
  {
    const{ repeatIndex, ...rest } = options;

    super(rest);

    safeAssign(this, { repeatIndex });
  }

  get spanDuration()
  {
    return this.slider.spanDuration();
  }


  public override applyDefaults(difficulty: BeatmapDifficultyInfo, timing: IBeatmapTiming): void
  {
    super.applyDefaults(difficulty, timing);

    if (this.repeatIndex > 0)
    {
      this.timeFadeIn = 0;
      this.timePreempt = this.spanDuration * 2;
    }
    else
    {
      this.timePreempt += this.startTime - this.slider.startTime;
    }
  }
}
