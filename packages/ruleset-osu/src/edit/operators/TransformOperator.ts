import type { OperatorContext } from "@osucad/editor";
import { Operator } from "@osucad/editor";
import { Vec2 } from "@osucad/framework";
import { Matrix } from "pixi.js";
import { Slider, type OsuHitObject } from "../../hitObjects";
import { OsuOperatorUtils } from "./OsuOperatorUtils";

export abstract class TransformOperator extends Operator
{
  protected readonly objects: OsuHitObject[];

  protected constructor(
    context: OperatorContext,
    objects: readonly OsuHitObject[],
  )
  {
    super(context);

    this.objects = objects.filter(OsuOperatorUtils.isMoveable);
  }

  public override get isValid(): boolean
  {
    console.log(this.objects.length);
    return this.objects.length > 0;
  }

  protected abstract getTransform(m: Matrix): Matrix;

  public override apply(): void
  {
    const transform = this.getTransform(Matrix.IDENTITY);

    if (transform.isIdentity())
      return;

    let pathTransform: Matrix | undefined = transform.clone().translate(-transform.tx, -transform.ty);

    if (pathTransform.isIdentity())
      pathTransform = undefined;

    for (const h of this.objects)
    {
      if (pathTransform && h instanceof Slider)
        h.applyToPath(p => p.transform(pathTransform));

      h.position = transform.apply(h.position, new Vec2());
    }
  }
}
