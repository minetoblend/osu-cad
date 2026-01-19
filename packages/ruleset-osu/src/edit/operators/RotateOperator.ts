import type { OperatorContext } from "@osucad/editor";
import { Operator } from "@osucad/editor";
import type { Matrix } from "pixi.js";
import { type OsuHitObject } from "../../hitObjects";
import { TransformOperator } from "./TransformOperator";
import { TransformOrigin } from "./TransformOrigin";
import { OsuOperatorUtils } from "./OsuOperatorUtils";
import { OsuPlayfield } from "../../ui";

interface RotateOptions
{
  angleDegrees?: number;
  origin?: TransformOrigin;
  clampToBounds?: boolean;
}

export class RotateOperator extends TransformOperator
{
  public override get title(): string
  {
    return "Rotate";
  }

  public constructor(
    context: OperatorContext,
    objects: readonly OsuHitObject[],
    {
      angleDegrees = 0,
      origin = TransformOrigin.playfield(),
      clampToBounds = false,
    }: RotateOptions = {},
  )
  {
    super(context , objects);

    this.angleDegrees = angleDegrees;
    this.origin = origin;
    this.clampToBounds = clampToBounds;
  }

  @Operator.parameter.float({ precision: 0.1 }, "Angle")
  public accessor angleDegrees

  @Operator.parameter()
  public accessor origin: TransformOrigin

  @Operator.parameter.checkbox("Clamp to bounds")
  public accessor clampToBounds: boolean

  protected override getTransform(m: Matrix): Matrix
  {
    const angle = this.angleDegrees / 180 * Math.PI;
    const origin = TransformOrigin.evaluate(this.origin, this.objects);

    if (!origin)
      return m;

    return m
      .translate(-origin.x, -origin.y)
      .rotate(angle)
      .translate(origin.x, origin.y);
  }

  public override apply(): void
  {
    super.apply();

    if (this.clampToBounds)
      OsuOperatorUtils.moveIntoBounds(this.objects, OsuPlayfield.BOUNDS);
  }
}
