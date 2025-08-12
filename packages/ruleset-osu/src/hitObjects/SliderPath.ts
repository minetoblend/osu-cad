import { bindableBacked, PathApproximator } from "@osucad/core";
import { Bindable, CachedValue, Vec2 } from "@osucad/framework";
import { CalculatedPath } from "./CalculatedPath";
import { PathPoint } from "./PathPoint";
import { PathType } from "./PathPoint";
import type { DDSAttributes } from "@osucad/multiplayer-core";
import { ObjectDDS, serializer, type, typeDecorator } from "@osucad/multiplayer-core";

export interface PathSegment
{
  readonly type: PathType
  readonly points: PathPoint[]
}

const pathPointSerializer = serializer<readonly PathPoint[], [number, number, PathType | null][]>({
  serialize: value => value.map(p => [p.position.x, p.position.y, p.type]),
  deserialize: value => value.map(([x, y, type]) => new PathPoint(new Vec2(x, y), type)),
});

export class SliderPath extends ObjectDDS
{
  readonly version = new Bindable(0);

  static readonly attributes: DDSAttributes = {
    type: "@osucad/slider-path",
    version: 0,
  };

  constructor()
  {
    super(SliderPath.attributes);
    this.controlPointsBindable.bindValueChanged(this.invalidatePath, this);
  }

  invalidatePath()
  {
    this.version.value++;
  }

  readonly expectedDistanceBindable = new Bindable(0);

  get distance()
  {
    return Math.min(this.expectedDistance, this.calculatedDistance);
  }

  @type("float64")
  @bindableBacked("expectedDistanceBindable")
  accessor expectedDistance!: number

  get calculatedDistance()
  {
    return this.calculatedPath.totalDistance;
  }

  readonly controlPointsBindable = new Bindable<readonly PathPoint[]>([]);

  @typeDecorator(pathPointSerializer)
  @bindableBacked("controlPointsBindable")
  accessor controlPoints!: readonly PathPoint[]

  readonly #calculatedPath = new CachedValue<CalculatedPath>();

  get calculatedPath(): CalculatedPath
  {
    this.#ensureValid();
    return this.#calculatedPath.value;
  }

  getPositionAtDistance(distance: number, out = new Vec2())
  {
    return this.calculatedPath.getPositionAtDistance(distance, out);
  }

  getRange(startProgress: number, endProgress: number)
  {
    const maxDistance = Math.min(this.expectedDistance, this.calculatedDistance);

    return this.calculatedPath.getRange(startProgress * maxDistance, endProgress * maxDistance);
  }

  #ensureValid()
  {
    if (!this.#calculatedPath.isValid)
      this.#calculatedPath.value = this.#calculatePath();
  }

  #calculatePath()
  {
    if (this.controlPoints.length <= 1)
    {
      return new CalculatedPath();
    }

    const points: Vec2[] = [Vec2.zero()];
    const cumulativeDistance: number[] = [0];

    for (const segment of this.pathSegments)
    {
      const segmentPoints = segment.points.map(p => p.position.clone());
      let calculatedSegment: Vec2[];

      switch (segment.type)
      {
      case PathType.Catmull:
        calculatedSegment = PathApproximator.approximateCatmull(segmentPoints);
        break;
      case PathType.Linear:
        calculatedSegment = segmentPoints;
        break;
      case PathType.BSpline:
        calculatedSegment = PathApproximator.approximateBSpline(segmentPoints, 3);
        break;
      case PathType.PerfectCurve:
        if (segmentPoints.length === 3)
          calculatedSegment = PathApproximator.approximateCircularArc(segmentPoints);
        else
          calculatedSegment = PathApproximator.approximateBezier(segmentPoints);
        break;
      default:
        calculatedSegment = PathApproximator.approximateBezier(segmentPoints);
        break;
      }

      for (const p of calculatedSegment)
      {
        const last = points[points.length - 1];
        const distance = last.distance(p);

        if (distance === 0)
          continue;

        points.push(p);
        cumulativeDistance.push(cumulativeDistance[cumulativeDistance.length - 1] + distance);
      }
    }

    return new CalculatedPath(points, cumulativeDistance);
  }

  get pathSegments(): PathSegment[]
  {
    const segments: PathSegment[] = [];

    let segmentStart = 0;
    let segmentType = this.controlPoints[0].type!;

    for (let i = 1; i < this.controlPoints.length; i++)
    {
      const controlPoint = this.controlPoints[i];

      if (controlPoint.type !== null || i === this.controlPoints.length - 1)
      {
        segments.push({
          type: segmentType,
          points: this.controlPoints.slice(segmentStart, i + 1),
        });

        segmentStart = i;
        segmentType = controlPoint.type!;
      }
    }

    return segments;
  }

  positionAt(progress: number, out: Vec2 = new Vec2())
  {
    return this.calculatedPath.getPositionAtDistance(progress * this.expectedDistance, out);
  }
}
