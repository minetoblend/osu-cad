import type { OperatorContext } from "@osucad/editor";
import { Operator } from "@osucad/editor";
import { PathPoint } from "../../hitObjects";
import { PathType } from "../../hitObjects";
import { Slider, type OsuHitObject } from "../../hitObjects";
import { OsuOperatorUtils } from "./OsuOperatorUtils";
import { PathSegment } from "../../hitObjects/PathSegment";

export class ReverseOperator extends Operator
{
  public override title = "Reverse";

  public constructor(context: OperatorContext, public readonly objects: readonly OsuHitObject[])
  {
    super(context);
  }

  public override get isValid(): boolean
  {
    return this.objects.length > 0;
  }

  @Operator.parameter.checkbox("Reverse slider bodies")
  public accessor reverseSliders = true

  @Operator.parameter.checkbox("Preserve slider shapes")
  public accessor exact = true

  public override apply(): void
  {
    const objects = this.objects;

    const startTime = Math.min(...objects.map(o => o.startTime));
    const endTime = Math.max(...objects.map(o => o.endTime));

    for (const object of objects)
    {
      const timeSinceStart = object.startTime - startTime;

      object.startTime = endTime - timeSinceStart - object.duration;

      if (object instanceof Slider && this.reverseSliders)
      {
        let controlPoints = object.controlPoints;

        if (this.exact)
        {
          controlPoints = OsuOperatorUtils.getSliderPathSlice(object.path, object.path.distance);
        }

        const lastPoint = controlPoints[controlPoints.length - 1];
        if (!lastPoint)
          continue;

        const reversed: PathPoint[] = [];


        let segmentStart = 0;
        let segmentType = controlPoints[0]?.type ?? PathType.Bezier;

        const segments: PathSegment[] = [];

        for (let i = 0; i< controlPoints.length; i++)
        {
          const controlPoint = controlPoints[i];

          if (controlPoint.type !== null || i === controlPoints.length - 1)
          {
            const points = controlPoints.slice(segmentStart, i + 1);

            if (points.length < 2)
              continue;

            segments.push( new PathSegment(segmentType, points));

            segmentStart = i;
            segmentType = controlPoint.type!;
          }
        }

        for (let i = segments.length - 1; i >= 0; i--)
        {
          const segment = segments[i];

          const points = segment.points.slice(i === 0 ? 0: 1).reverse();

          reversed.push(
              ...points.map((p, index) =>
                new PathPoint(
                    p.sub(lastPoint.position),
                    index === 0 ? segment.type : null,
                ),
              ),
          );
        }
        object.controlPoints = reversed;
        object.moveBy(lastPoint.position.x, lastPoint.position.y);
      }

      this.applyDefaults(object);
    }
  }
}
