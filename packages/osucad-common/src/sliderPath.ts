import {clamp} from "@vueuse/core";
import {ref, shallowRef} from "vue";
import {Bounds} from "pixi.js";
import {Vec2} from "./vec2";
import {Vector2, PathApproximator} from "osu-classes";
import {ControlPointList} from "./controlPointList";

export interface PathPoint {
  position: Vec2;
  type: PathType | null;
}

export const enum PathType {
  Linear = "L",
  PerfectCurve = "P",
  Bezier = "B",
  Catmull = "C",
  BSpline = "S",
}

export class SliderPath {
  constructor(controlPointList: ControlPointList) {
    this.controlPoints = controlPointList.controlPoints;
    controlPointList.on("change", () => {
      this.isDirty.value = true;
    });
  }

  readonly controlPoints: PathPoint[];
  private _calculatedPath = shallowRef<Vec2[]>([]);
  private _cumulativeDistance = shallowRef<number[]>([]);

  private _expectedDistance = ref(0);

  get expectedDistance() {
    return this._expectedDistance.value
  }

  set expectedDistance(value: number) {
    this._expectedDistance.value = value;
  }

  get calculatedPath() {
    this.ensureValid();
    return this._calculatedPath.value;
  }

  get cumulativeDistance() {
    return this._cumulativeDistance.value;
  }

  get endPosition(): Vec2 {
    return this.getPositionAtDistance(this.expectedDistance);
  }

  getRange(start: number, end: number) {
    this.ensureValid();
    let d0 = start;
    let d1 = end;

    let i = 0;

    const cumulativeDistance = this.cumulativeDistance;

    for (; i < this.calculatedPath.length && cumulativeDistance[i] < d0; ++i) {
    }

    const path: Vec2[] = [];
    path.push(this.interpolateVertices(i, d0));

    const t = i;
    for (; i < this.calculatedPath.length && cumulativeDistance[i] <= d1; ++i) {
      const p = this.calculatedPath[i];
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

    let p0 = this.calculatedPath[i - 1];
    let p1 = this.calculatedPath[i];

    let d0 = this.cumulativeDistance[i - 1];
    let d1 = this.cumulativeDistance[i];

    // Avoid division by and almost-zero number in case two points are extremely close to each other.
    if (Math.abs(d0 - d1) < 0.001) return p0;

    const w = (d - d0) / (d1 - d0);
    return Vec2.lerp(p0, p1, w);
  }

  private isDirty = ref(true);

  protected ensureValid() {
    if (this.isDirty.value) {
      this.calculatePath();
    }
  }

  protected calculatePath() {
    if (this.controlPoints.length <= 1) {
      this._calculatedPath.value = [];
      this.isDirty.value = false;
      return;
    }

    let segmentStart = 0;
    const points = [this.controlPoints[0].position] as Vec2[];
    const cumulativeDistance = [0] as number[];

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

          points.push({ x: point.x, y: point.y });
          cumulativeDistance.push(
            cumulativeDistance[cumulativeDistance.length - 1] +
            Vec2.distance(last, point),
          );
        }

        segmentStart = i;
      }
    }

    this._calculatedPath.value = points;
    this._cumulativeDistance.value = cumulativeDistance;

    this.isDirty.value = false;
  }

  getPositionAtDistance(d: number): Vec2 {
    if (this._calculatedPath.value.length <= 1) return { x: 0, y: 0 };
    let i = 0;
    while (i < this._cumulativeDistance.value.length - 1) {
      if (this._cumulativeDistance.value[i + 1] > d) break;
      i++;
    }

    const start = this._calculatedPath.value[i];
    const end = this._calculatedPath.value[i + 1];
    const distance =
      this._cumulativeDistance.value[i + 1] - this._cumulativeDistance.value[i];
    let t = (d - this._cumulativeDistance.value[i]) / distance;

    t = clamp(t, 0, 1);

    if (!end) return start;

    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  }

  private calculateSegment(type: PathType, start: number, end: number) {
    const points = this.controlPoints
      .slice(start, end + 1)
      .map((p) => new Vector2(p.position.x, p.position.y));
    switch (type) {
      case PathType.Linear:
        return PathApproximator.approximateLinear(points);
      case PathType.BSpline:
        return PathApproximator.approximateBSpline(points, 3);
      case PathType.PerfectCurve:
        if (points.length === 3)
          return PathApproximator.approximateCircularArc(points);
      case PathType.Bezier:
        return PathApproximator.approximateBezier(points);
      case PathType.Catmull:
        return PathApproximator.approximateCatmull(points);
    }
  }

  getBounds(): Bounds {
    const bounds = new Bounds();
    this.calculatedPath.forEach((p) => bounds.addPoint(p));
    return bounds;
  }
}
