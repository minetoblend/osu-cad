import { ControlPoint } from "@osucad/core";
import { type, type DDSAttributes } from "@osucad/multiplayer-core";

export class SliderVelocityPoint extends ControlPoint
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/slider-velocity-point",
    version: 0,
  };

  public constructor()
  {
    super(SliderVelocityPoint.attributes);
  }

  @type("float32")
  public accessor velocity = 1

  public override isRedundant(other: ControlPoint): boolean
  {
    if (other instanceof SliderVelocityPoint)
    {
      return this.velocity === other.velocity;
    }

    return false;
  }
}
