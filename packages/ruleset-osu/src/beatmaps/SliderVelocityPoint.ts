import { ControlPoint } from "@osucad/core";
import { type, type DDSAttributes } from "@osucad/multiplayer-core";

export class SliderVelocityPoint extends ControlPoint
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/slider-velocity-point",
    version: 0,
  };

  constructor()
  {
    super(SliderVelocityPoint.attributes);
  }

  @type("float32")
  accessor velocity = 1
}
