import { Operator, type OperatorContext } from "@osucad/editor";
import type { Matrix } from "pixi.js";
import type { OsuHitObject } from "../../hitObjects";
import { TransformOperator } from "./TransformOperator";
import { OsuPlayfield } from "../../ui";

export class FlipOperator extends TransformOperator
{
  public override get title(): string
  {
    return "Flip";
  }

  public constructor(
    context: OperatorContext,
    objects: readonly OsuHitObject[],
    options: { horizontal?: boolean, vertical?: boolean },
  )
  {
    super(context, objects);

    this.horizontal = options.horizontal ?? false;
    this.vertical = options.vertical ?? false;
  }

  @Operator.parameter.checkbox()
  public accessor horizontal: boolean;

  @Operator.parameter.checkbox()
  public accessor vertical: boolean;


  protected override getTransform(m: Matrix): Matrix
  {
    if (this.horizontal)
      m = m.scale(-1, 1).translate(OsuPlayfield.SIZE.x, 0);

    if (this.vertical)
      m = m.scale(1, -1).translate(0, OsuPlayfield.SIZE.y);

    return m;
  }
}
