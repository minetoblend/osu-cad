import { Bindable, BoundsBuilder, CachedValue, Rectangle, Vec2 } from "@osucad/framework";
import { CalculatedPath } from "./CalculatedPath";
import type { PathPoint } from "./PathPoint";
import { PathType } from "./PathPoint";
import { PathSegment } from "./PathSegment";


export class SliderPath
{
  public readonly version = new Bindable(0);

  public readonly controlPointsBindable = new Bindable<readonly PathPoint[]>([]);

  public readonly expectedDistanceBindable = new Bindable(0);

  public get expectedDistance()
  {
    return this.expectedDistanceBindable.value;
  }

  public get controlPoints()
  {
    return this.controlPointsBindable.value;
  }

  public constructor(
    controlPointsBindable?: Bindable<readonly PathPoint[]>,
    expectedDistanceBindable?: Bindable<number>,
  )
  {
    if (controlPointsBindable)
      this.controlPointsBindable.bindTo(controlPointsBindable);

    if (expectedDistanceBindable)
      this.expectedDistanceBindable.bindTo(expectedDistanceBindable);


    this.controlPointsBindable.bindValueChanged(this.invalidatePath, this);
    this.expectedDistanceBindable.bindValueChanged(() => this.#fullRange.invalidate());
  }

  public invalidatePath()
  {
    this.#calculatedPath.invalidate();
    this.#fullRange.invalidate();
    this.version.value++;
  }

  public get distance()
  {
    return Math.min(this.expectedDistance, this.calculatedDistance);
  }



  public get calculatedDistance()
  {
    return this.calculatedPath.totalDistance;
  }



  #bounds = new Rectangle(0,0,0,0);
  readonly #calculatedPath = new CachedValue<CalculatedPath>();
  readonly #fullRange = new CachedValue<readonly Vec2[]>();

  public get calculatedPath(): CalculatedPath
  {
    this.#ensureValid();
    return this.#calculatedPath.value;
  }

  public get bounds()
  {
    this.#ensureValid();
    return this.#bounds;
  }

  public get calculatedRange(): readonly Vec2[]
  {
    if (!this.#fullRange.isValid)
      this.#fullRange.value = this.getRange(0, 1);

    return this.#fullRange.value;
  }

  public getPositionAtDistance(distance: number, out = new Vec2())
  {
    return this.calculatedPath.getPositionAtDistance(distance, out);
  }

  public getRange(startProgress: number, endProgress: number)
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
      this.#bounds = new Rectangle(0,0,0,0);
      return new CalculatedPath();
    }

    const points: Vec2[] = [Vec2.zero()];
    const cumulativeDistance: number[] = [0];
    const bounds = new BoundsBuilder();

    bounds.addPoint(points[0]);

    for (const segment of this.pathSegments)
    {
      for (const p of segment.vertices)
      {
        const last = points[points.length - 1];
        const distance = last.distance(p);

        if (distance === 0)
          continue;

        bounds.addPoint(p);
        points.push(p);
        cumulativeDistance.push(cumulativeDistance[cumulativeDistance.length - 1] + distance);
      }
    }

    this.#bounds = bounds.rect() ?? new Rectangle(0,0,0,0);

    return new CalculatedPath(points, cumulativeDistance);
  }

  public get pathSegments(): PathSegment[]
  {
    const segments: PathSegment[] = [];

    let segmentStart = 0;
    let segmentType = this.controlPoints[0]?.type ?? PathType.Bezier;

    for (let i = 1; i < this.controlPoints.length; i++)
    {
      const controlPoint = this.controlPoints[i];

      if (controlPoint.type !== null || i === this.controlPoints.length - 1)
      {
        const points = this.controlPoints.slice(segmentStart, i + 1);

        segments.push( new PathSegment(segmentType, points));

        segmentStart = i;
        segmentType = controlPoint.type!;
      }
    }

    return segments;
  }

  public positionAt(progress: number, out: Vec2 = new Vec2())
  {
    return this.calculatedPath.getPositionAtDistance(progress * this.expectedDistance, out);
  }
}
