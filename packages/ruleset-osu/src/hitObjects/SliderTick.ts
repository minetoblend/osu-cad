import type { ControlPointInfo } from "@osucad/core";
import { HitSampleInfo, HitWindows, safeAssign } from "@osucad/core";
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
  public spanIndex = 0;

  public spanStartTime = 0;

  public pathProgress = 0;

  public constructor(options: SliderTickOptions = {})
  {
    const { spanIndex, spanStartTime, pathProgress, ...rest } = options;

    super({ type: "@osucad/slider-tick",version: 0 }, rest);

    safeAssign(this, { spanIndex, spanStartTime, pathProgress });
  }

  protected override createHitWindows()
  {
    return HitWindows.Empty;
  }

  protected override createSamples(controlPoints: ControlPointInfo): HitSampleInfo[]
  {
    const samples = super.createSamples(controlPoints);

    const sample = samples.find(it => it.name === HitSampleInfo.HIT_NORMAL) ?? samples[0];

    return sample? [sample.with("slidertick")] : [];
  }
}
