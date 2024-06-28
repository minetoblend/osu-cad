import { PathType, SerializedPathPoint } from '../types';
import { Vec2 } from 'osucad-framework';
import { PathApproximator, Vector2 } from 'osu-classes';
import { clamp } from '../util/clamp';

export class SliderPath {
  controlPoints: SerializedPathPoint[];
  private _expectedDistance = 0;

  constructor(path: SerializedPathPoint[] = [], expectedDistance: number = 0) {
    this.controlPoints = path;
    this._expectedDistance = expectedDistance;
  }

  private _version = 0;
  private _calculatedPath: Vec2[] | undefined;
  private _cumulativeDistance: number[] | undefined;
  private _calculatedRange: Vec2[] | undefined;
  private _endPosition: Vec2 | undefined;

  get expectedDistance() {
    return this._expectedDistance;
  }

  set expectedDistance(value: number) {
    if (value === this._expectedDistance) return;
    this._expectedDistance = value;
    this._calculatedRange = undefined;
    this._endPosition = undefined;
    this._version++;
  }

  get endPosition() {
    if (this._endPosition === undefined)
      this._endPosition = this.getPositionAtDistance(this.expectedDistance);
    return this._endPosition;
  }

  invalidate() {
    this._calculatedPath = undefined;
    this._calculatedRange = undefined;
    this._endPosition = undefined;
    this._version++;
  }

  get calculatedPath() {
    if (this._calculatedPath === undefined) {
      const [path, cumulativeDistance] = this._calculatePath();
      this._calculatedPath = path;
      this._cumulativeDistance = cumulativeDistance;
    }
    return this._calculatedPath;
  }

  get calculatedRange() {
    if (this._calculatedRange === undefined)
      this._calculatedRange = this.getRange(0, this.expectedDistance);
    return this._calculatedRange;
  }

  get cumulativeDistance() {
    if (this._cumulativeDistance === undefined) {
      const [path, cumulativeDistance] = this._calculatePath();
      this._calculatedPath = path;
      this._cumulativeDistance = cumulativeDistance;
    }
    return this._cumulativeDistance;
  }

  get totalLength() {
    return this.cumulativeDistance[this.cumulativeDistance.length - 1] ?? 0;
  }

  get version() {
    return this._version;
  }

  private _calculatePath(): [Vec2[], number[]] {
    if (this.controlPoints.length === 0) return [[new Vec2(0, 0)], [0]];

    const points: Vec2[] = [
      new Vec2(this.controlPoints[0].x, this.controlPoints[0].y),
    ] as Vec2[];
    const cumulativeDistance = [0] as number[];
    let segmentStart = 0;

    for (let i = 1; i < this.controlPoints.length; i++) {
      if (
        this.controlPoints[i].type !== null ||
        i === this.controlPoints.length - 1
      ) {
        const segment = this.calculateSegment(
          this.controlPoints[segmentStart].type ?? PathType.Bezier,
          segmentStart,
          i,
        );

        for (const point of segment) {
          const last = points[points.length - 1];
          if (Vec2.equals(last, point)) continue;

          points.push(new Vec2(point.x, point.y));
          cumulativeDistance.push(
            cumulativeDistance[cumulativeDistance.length - 1] +
              Vec2.distance(last, point),
          );
        }

        segmentStart = i;
      }
    }

    return [points, cumulativeDistance];
  }

  private calculateSegment(type: PathType, start: number, end: number) {
    const points = this.controlPoints
      .slice(start, end + 1)
      .map((p) => new Vector2(p.x, p.y));
    switch (type) {
      case PathType.Linear:
        return PathApproximator.approximateLinear(points);
      case PathType.PerfectCurve:
        if (points.length === 3)
          return PathApproximator.approximateCircularArc(points);
      case PathType.Bezier:
        return PathApproximator.approximateBezier(points);
      case PathType.Catmull:
        return PathApproximator.approximateCatmull(points);
    }
  }

  getRange(start: number, end: number) {
    const d0 = start;
    const d1 = end;

    let i = 0;

    const calculatedPath = this.calculatedPath;
    const cumulativeDistance = this.cumulativeDistance;

    for (; i < calculatedPath.length && cumulativeDistance[i] < d0; ++i) {}

    const path: Vec2[] = [];
    path.push(this.interpolateVertices(i, d0));

    for (; i < calculatedPath.length && cumulativeDistance[i] <= d1; ++i) {
      const p = calculatedPath[i];
      if (!Vec2.equals(path[path.length - 1], p)) path.push(p);
    }

    const p = this.interpolateVertices(i, d1);
    if (!Vec2.equals(path[path.length - 1], p)) path.push(p);

    return path;
  }

  interpolateVertices(i: number, d: number) {
    if (this.calculatedPath.length === 0) return Vec2.zero();

    if (i <= 0) return this.calculatedPath[0];
    if (i >= this.calculatedPath.length)
      return this.calculatedPath[this.calculatedPath.length - 1];

    const p0 = this.calculatedPath[i - 1];
    const p1 = this.calculatedPath[i];

    const d0 = this.cumulativeDistance[i - 1];
    const d1 = this.cumulativeDistance[i];

    // Avoid division by and almost-zero number in case two points are extremely close to each other.
    if (Math.abs(d0 - d1) < 0.001) return p0;

    const w = (d - d0) / (d1 - d0);
    return Vec2.lerp(p0, p1, w);
  }

  getPositionAtDistance(d: number): Vec2 {
    if (this.calculatedPath.length <= 1) return new Vec2();
    let i = 0;
    const calculatedPath = this.calculatedPath;
    const cumulativeDistance = this.cumulativeDistance;
    while (i < cumulativeDistance.length - 1) {
      if (cumulativeDistance[i + 1] > d) break;
      i++;
    }

    const start = calculatedPath[i];
    const end = calculatedPath[i + 1];
    const distance = cumulativeDistance[i + 1] - cumulativeDistance[i];
    let t = (d - cumulativeDistance[i]) / distance;

    t = clamp(t, 0, 1);

    if (!end) return start;

    return new Vec2(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
    );
  }
}
