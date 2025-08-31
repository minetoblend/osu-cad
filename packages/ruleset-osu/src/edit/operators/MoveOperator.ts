import type { OperatorContext } from "@osucad/editor";
import { Operator } from "@osucad/editor";
import { Vec2 } from "@osucad/framework";
import type { Matrix } from "pixi.js";
import { type OsuHitObject } from "../../hitObjects";
import { OsuOperatorUtils } from "./OsuOperatorUtils";
import { TransformOperator } from "./TransformOperator";

export class MoveOperator extends TransformOperator
{
  @Operator.parameter.vec2()
  public accessor movement: Vec2

  @Operator.parameter.checkbox("Clamp to bounds")
  public accessor clampToBounds = true

  public override get title(): string
  {
    return "Move";
  }

  public constructor(
    context: OperatorContext,
    objects: readonly OsuHitObject[],
    movement?: Vec2,
  )
  {
    super(context, objects);

    this.movement = movement ?? Vec2.zero();
  }

  protected override getTransform(m: Matrix): Matrix
  {
    let movement = this.movement;

    if (this.clampToBounds)
    {
      movement = OsuOperatorUtils.restrictMovement(this.objects, movement, true);
    }

    return m.translate(movement.x, movement.y);
  }

  public setMovement(movement: Vec2)
  {
    if (this.clampToBounds)
    {
      movement = OsuOperatorUtils.restrictMovement(this.objects, movement.sub(this.movement)).add(this.movement);
    }

    this.movement = movement;
  }
}
