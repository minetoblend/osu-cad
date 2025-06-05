import type { Drawable } from "@osucad/framework";
import { CompositeDrawable, EasingFunction } from "@osucad/framework";

const pressed_scale = 1.2;
const released_scale = 1;

export class SkinnableCursor extends CompositeDrawable
{
  public expand()
  {
    this.expandTarget?.scaleTo(released_scale)
      .scaleTo(pressed_scale, 400, EasingFunction.OutElasticHalf);
  }

  contract()
  {
    this.expandTarget?.scaleTo(released_scale, 400, EasingFunction.OutQuad);
  }

  expandTarget?: Drawable;
}
