import type { Vec2 } from 'osucad-framework';
import { almostEquals, lerp } from 'osucad-framework';
import { MeshGeometry } from 'pixi.js';

export class StrokePoint {
  constructor(
    readonly position: Vec2,
    readonly radius: number,
  ) {
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }
}

export interface BrushStrokeGeometryOptions {
  points?: StrokePoint[];
}

export class BrushStrokeGeometry extends MeshGeometry {
  /** An array of points that determine the rope. */
  public points: StrokePoint[];

  /**
   * @param options - Options to be applied to rope geometry
   */
  constructor(options: BrushStrokeGeometryOptions) {
    const { points = [] } = options;

    super({
      positions: new Float32Array(points.length * 4),
      uvs: new Float32Array(points.length * 4),
      indices: new Uint32Array(Math.max(0, (points.length - 1) * 6)),
    });

    this.points = points;

    this.#build();
  }

  #radiusOffset = 0;

  get radiusOffset() {
    return this.#radiusOffset;
  }

  set radiusOffset(value) {
    if (value === this.#radiusOffset)
      return;
    this.#radiusOffset = value;
    this.update();
  }

  #build(): void {
    const points = this.smoothPath;

    if (!points)
      return;

    const vertexBuffer = this.getBuffer('aPosition');
    const uvBuffer = this.getBuffer('aUV');
    const indexBuffer = this.getIndex();

    if (points.length < 1) {
      return;
    }

    // if the number of points has changed we will need to recreate the arraybuffers
    if (vertexBuffer.data.length / 4 !== points.length) {
      vertexBuffer.data = new Float32Array(points.length * 4);
      uvBuffer.data = new Float32Array(points.length * 4);
      indexBuffer.data = new Uint16Array(Math.max(0, (points.length - 1) * 6));
    }

    const indices = indexBuffer.data;

    const total = points.length;

    let indexCount = 0;

    for (let i = 0; i < total - 1; i++) {
      const index = i * 2;

      indices[indexCount++] = index;
      indices[indexCount++] = index + 1;
      indices[indexCount++] = index + 2;

      indices[indexCount++] = index + 2;
      indices[indexCount++] = index + 1;
      indices[indexCount++] = index + 3;
    }

    indexBuffer.update();

    this.updateVertices();
  }

  get smoothPath() {
    if (this.points.length <= 2)
      return this.points;

    return this.points;

    const path: StrokePoint[] = [
      this.points[0],
    ];

    let distance = 0;
    const step = 2;

    for (let i = 1; i < this.points.length - 1; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const next = this.points[i + 1];

      const currDistance = curr.position.distance(next);
      if (almostEquals(currDistance, 0))
        continue;

      distance += step;

      while (distance < currDistance) {
        const t = distance / currDistance * 0.5 + 0.25;

        const p1 = prev.position.lerp(curr.position, t);
        const p2 = curr.position.lerp(next.position, t);

        path.push(
          new StrokePoint(
            p1.lerp(p2, t),
            lerp(
              lerp(prev.radius + this.#radiusOffset, curr.radius + this.#radiusOffset, t),
              lerp(curr.radius + this.#radiusOffset, next.radius + this.#radiusOffset, t),
              t,
            ),
          ),
        );

        distance += step;
      }

      distance -= currDistance;
    }

    path.push(this.points[this.points.length - 1]);

    return path;
  }

  /** refreshes vertices of Rope mesh */
  public updateVertices(): void {
    const points = this.smoothPath;

    if (points.length < 1) {
      return;
    }

    let lastPoint = points[0];
    let nextPoint: StrokePoint;
    let perpX = 0;
    let perpY = 0;

    const vertices = this.getBuffer('aPosition').data;
    const total = points.length;

    for (let i = 0; i < total; i++) {
      const point = points[i];
      const index = i * 4;
      const halfWidth = point.radius + this.#radiusOffset;

      if (i < points.length - 1) {
        nextPoint = points[i + 1];
      }
      else {
        nextPoint = point;
      }

      perpY = -(nextPoint.x - lastPoint.x);
      perpX = nextPoint.y - lastPoint.y;

      let ratio = (1 - (i / (total - 1))) * 10;

      if (ratio > 1) {
        ratio = 1;
      }

      const perpLength = Math.sqrt((perpX * perpX) + (perpY * perpY));

      if (perpLength < 1e-6) {
        perpX = 0;
        perpY = 0;
      }
      else {
        perpX /= perpLength;
        perpY /= perpLength;

        perpX *= halfWidth;
        perpY *= halfWidth;
      }

      vertices[index] = point.x + perpX;
      vertices[index + 1] = point.y + perpY;
      vertices[index + 2] = point.x - perpX;
      vertices[index + 3] = point.y - perpY;

      lastPoint = point;
    }

    this.getBuffer('aPosition').update();
  }

  public update(): void {
    this.#build();
  }
}
