import { safeAssign } from "@osucad/core";
import type { OsuHitObjectOptions } from "./OsuHitObject";
import { OsuHitObject } from "./OsuHitObject";

export interface SliderTickOptions extends OsuHitObjectOptions
{
  spanIndex?: number
  spanStartTime?: number
  pathProgress?: number
}

export class SliderTick extends OsuHitObject
{
  spanIndex = 0;

  spanStartTime = 0;

  pathProgress = 0;

  constructor(options: SliderTickOptions = {})
  {
    const { spanIndex, spanStartTime, pathProgress, ...rest } = options;

    super(rest);

    safeAssign(this, { spanIndex, spanStartTime, pathProgress });
  }
}
