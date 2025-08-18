import { CompositeDrawable } from "@osucad/framework";
import type { Slider } from "../../../hitObjects";

export class SliderPathVisualizer extends CompositeDrawable
{
  constructor(readonly slider: Slider)
  {
    super();
  }
}
