import { Drawable, EasingFunction } from "@osucad/framework";
import { extensions } from "pixi.js";


declare global
{
  namespace OsucadMixins
  {
    interface Drawable
    {
      shake(shakeDuration?: number, shakeMagnitude?: number, maximumLength?: number): void
    }
  }
}

export function shake(target: Drawable, shakeDuration = 80, shakeMagnitude = 8, maximumLength?: number)
{
  if (maximumLength !== undefined && maximumLength < shakeDuration * 2)
    return;

  let sequence = target
    .moveToX(shakeMagnitude, shakeDuration / 2, EasingFunction.OutSine).then()
    .moveToX(-shakeMagnitude, shakeDuration, EasingFunction.InOutSine).then();

  if (maximumLength === undefined || maximumLength >= shakeDuration * 4)
  {
    sequence = sequence
      .moveToX(shakeMagnitude, shakeDuration, EasingFunction.InOutSine).then()
      .moveToX(-shakeMagnitude, shakeDuration, EasingFunction.InOutSine).then();
  }

  sequence.moveToX(0, shakeDuration / 2, EasingFunction.InSine);
}

const mixin: Partial<Drawable> = {
  shake(shakeDuration = 80, shakeMagnitude = 8, maximumLength?: number)
  {
    shake(this, shakeDuration, shakeMagnitude, maximumLength);
  },
} as Drawable;

extensions.mixin(Drawable, mixin);
