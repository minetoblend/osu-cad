import type { SliderTailOptions } from "./SliderTailCircle";
import { SliderTailCircle } from "./SliderTailCircle";
import type { Slider } from "./Slider";
import { safeAssign } from "@osucad/core";

export interface SliderRepeatOptions extends SliderTailOptions
{
  pathProgress?: number
}

export class SliderRepeat extends SliderTailCircle
{


  constructor(slider: Slider, options: SliderRepeatOptions = {})
  {
    const { pathProgress, ...rest } = options;

    super(slider, rest);

    safeAssign(this, { pathProgress });
  }

  pathProgress = 0;
}
