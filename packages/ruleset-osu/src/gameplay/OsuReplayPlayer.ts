import type { AutoPlayFrameContext, DrawableHitObject, HitObject } from "@osucad/core";
import { AutoPlayController } from "@osucad/core";
import type { IInput } from "@osucad/framework";

export class OsuReplayPlayer extends AutoPlayController
{
  protected override *process(ctx: AutoPlayFrameContext<DrawableHitObject<HitObject>>): Iterable<IInput>
  {
  }
}
