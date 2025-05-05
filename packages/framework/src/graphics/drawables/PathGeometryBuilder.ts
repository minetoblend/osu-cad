import { Line } from "../../math/Line";
import { Vec2 } from "../../math/Vec2";

const max_res = 24;

export class PathGeometryBuilder {
  constructor(
    readonly radius: number,
    readonly segments: readonly Line[],
  ) {
  }

  index = 0;

  indices: number[] = [];
  positions: number[] = [];
  texCoords: number[] = [];

  build() {
    const { segments, radius } = this;

    let prevSegmentLeft: Line | undefined;
    let prevSegmentRight: Line | undefined;

    for (let i = 0; i < segments.length; i++) {
      const currSegment = segments[i];

      let ortho = currSegment.orthogonalDirection;
      if (Number.isNaN(ortho.x) || Number.isNaN(ortho.y))
        ortho = new Vec2(0, 1);

      const orthoScaled = ortho.scale(radius);

      const currSegmentLeft = new Line(currSegment.startPoint.add(orthoScaled), currSegment.endPoint.add(orthoScaled));
      const currSegmentRight = new Line(currSegment.startPoint.sub(orthoScaled), currSegment.endPoint.sub(orthoScaled));

      this.#addSegmentQuads(currSegment, currSegmentLeft, currSegmentRight);

      if (i > 0) {
        const thetaDiff = currSegment.theta - segments[i - 1].theta;
        this.#addSegmentCaps(thetaDiff, currSegmentLeft, currSegmentRight, prevSegmentLeft!, prevSegmentRight!);
      }

      if (i === 0) {
        const flippedLeft = new Line(currSegmentRight.endPoint, currSegmentRight.startPoint);
        const flippedRight = new Line(currSegmentLeft.endPoint, currSegmentLeft.startPoint);

        this.#addSegmentCaps(Math.PI, currSegmentLeft, currSegmentRight, flippedLeft, flippedRight);
      }

      if (i === segments.length - 1) {
        const flippedLeft = new Line(currSegmentRight.endPoint, currSegmentRight.startPoint);
        const flippedRight = new Line(currSegmentLeft.endPoint, currSegmentLeft.startPoint);

        this.#addSegmentCaps(Math.PI, flippedLeft, flippedRight, currSegmentLeft, currSegmentRight);
      }

      prevSegmentLeft = currSegmentLeft;
      prevSegmentRight = currSegmentRight;
    }

    return this;
  }

  #addSegmentQuads(segment: Line, segmentLeft: Line, segmentRight: Line) {
    this.addTriangle(
      segmentRight.endPoint.x,
      segmentRight.endPoint.y,
      0,
      segmentRight.startPoint.x,
      segmentRight.startPoint.y,
      0,
      segment.startPoint.x,
      segment.startPoint.y,
      1,
    );

    this.addTriangle(
      segment.startPoint.x,
      segment.startPoint.y,
      1,
      segment.endPoint.x,
      segment.endPoint.y,
      1,
      segmentRight.endPoint.x,
      segmentRight.endPoint.y,
      0,
    );

    this.addTriangle(
      segment.startPoint.x,
      segment.startPoint.y,
      1,
      segment.endPoint.x,
      segment.endPoint.y,
      1,
      segmentLeft.endPoint.x,
      segmentLeft.endPoint.y,
      0,
    );

    this.addTriangle(
      segmentLeft.endPoint.x,
      segmentLeft.endPoint.y,
      0,
      segmentLeft.startPoint.x,
      segmentLeft.startPoint.y,
      0,
      segment.startPoint.x,
      segment.startPoint.y,
      1,
    );
  }

  #addSegmentCaps(
    thetaDiff: number,
    segmentLeft: Line,
    segmentRight: Line,
    prevSegmentLeft: Line,
    prevSegmentRight: Line,
  ) {
    if (Math.abs(thetaDiff) > Math.PI)
      thetaDiff = -Math.sign(thetaDiff) * 2 * Math.PI + thetaDiff;

    if (thetaDiff === 0)
      return;

    const origin = (segmentLeft.startPoint.add(segmentRight.startPoint)).scaleInPlace(0.5);

    let current = thetaDiff > 0 ? prevSegmentRight.endPoint : prevSegmentLeft.endPoint;
    const end = thetaDiff > 0 ? segmentRight.startPoint : segmentLeft.startPoint;

    const start = thetaDiff > 0 ? new Line(prevSegmentLeft.endPoint, prevSegmentRight.endPoint) : new Line(prevSegmentRight.endPoint, prevSegmentLeft.endPoint);
    const theta0 = start.theta;
    const thetaStep = Math.sign(thetaDiff) * Math.PI / max_res;
    const stepCount = Math.ceil(thetaDiff / thetaStep);

    for (let i = 1; i <= stepCount; i++) {
      const next = i < stepCount ? origin.add(pointOnCircle(theta0 + i * thetaStep).scaleInPlace(this.radius)) : end;

      this.addTriangle(
        origin.x,
        origin.y,
        1,

        current.x,
        current.y,
        0,

        next.x,
        next.y,
        0,
      );

      current = next;
    }
  }

  addTriangle(
    x1: number,
    y1: number,
    z1: number,

    x2: number,
    y2: number,
    z2: number,

    x3: number,
    y3: number,
    z3: number,
  ) {
    this.positions.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);
    this.texCoords.push(z1, 0.5, z2, 0.5, z3, 0.5);
    this.indices.push(this.index, this.index + 1, this.index + 2);

    this.index += 3;
  }

  addVertex(
    x: number,
    y: number,
    z: number,
    u: number,
    v: number,
  ) {
    this.positions.push(x, y, z);
    this.texCoords.push(u, v);
  }
}

function pointOnCircle(angle: number) {
  return new Vec2(
    Math.cos(angle),
    Math.sin(angle),
  );
}
