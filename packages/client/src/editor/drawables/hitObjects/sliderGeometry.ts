import {Vec2} from "@osucad/common";

function getTheta(from: Vec2, to: Vec2) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function getJoinGeometryCount(thetaDiff: number) {
  let step = Math.PI / 24.0;

  let absThetaDiff = Math.abs(thetaDiff);

  const amountOfOuterPoints = Math.ceil(absThetaDiff / step) + 1;

  return {
    vertices: (amountOfOuterPoints + 1) * 3,
    indices: (amountOfOuterPoints - 1) * 3,
  };
}

export class GeometryBuilder {
  readonly vertices: Float32Array;
  readonly indices: Uint16Array;

  vertexCursor = 0;
  indexCursor = 0;

  constructor(numVertices: number, numIndices: number) {
    this.vertices = new Float32Array(numVertices);
    this.indices = new Uint16Array(numIndices);
  }

  addVertex(x: number, y: number, z: number) {
    const index = this.vertexCursor * 3;
    this.vertices[index] = x;
    this.vertices[index + 1] = y;
    this.vertices[index + 2] = z;
    this.vertexCursor++;
  }

  addIndex(index: number) {
    this.indices[this.indexCursor++] = index;
  }

  addTriangleIndices(a: number, b: number, c: number) {
    this.indices[this.indexCursor++] = a;
    this.indices[this.indexCursor++] = b;
    this.indices[this.indexCursor++] = c;
  }

  addJoin(position: Vec2, theta: number, thetaDiff: number, radius: number) {
    let step = Math.PI / 24.0;

    let dir = Math.sign(thetaDiff);

    let absThetaDiff = Math.abs(thetaDiff);

    let amountPoints = Math.ceil(absThetaDiff / step);

    if (dir < 0.0) {
      theta += Math.PI;
    }

    const baseIndex = this.vertexCursor;
    this.addVertex(position.x, position.y, 0);

    for (let i = 0; i <= amountPoints; i++) {
      let angularOffset = Math.min(i * step, absThetaDiff);
      let angle = theta + dir * angularOffset;

      this.addVertex(
        position.x + Math.sin(angle) * radius,
        position.y - Math.cos(angle) * radius,
        1,
      );

      if (i > 0)
        this.addTriangleIndices(baseIndex, baseIndex + i, baseIndex + i + 1);
    }
  }

  addStraightSegment(from: Vec2, to: Vec2, radius: number) {
    const length = Vec2.distance(to, from);
    const dirX = (to.x - from.x) / length;
    const dirY = (to.y - from.y) / length;

    const dirLX = -dirY * radius;
    const dirLY = dirX * radius;

    let cursor = this.vertexCursor;

    this.addVertex(from.x + dirLX, from.y + dirLY, 1.0);
    this.addVertex(from.x, from.y, 0.0);
    this.addVertex(from.x - dirLX, from.y - dirLY, 1.0);
    this.addVertex(to.x + dirLX, to.y + dirLY, 1.0);
    this.addVertex(to.x, to.y, 0.0);
    this.addVertex(to.x - dirLX, to.y - dirLY, 1.0);

    this.addTriangleIndices(cursor, cursor + 3, cursor + 1);
    this.addTriangleIndices(cursor + 3, cursor + 4, cursor + 1);
    this.addTriangleIndices(cursor + 1, cursor + 4, cursor + 5);
    this.addTriangleIndices(cursor + 5, cursor + 2, cursor + 1);
  }
}

function md(a: number, n: number): number {
  return ((a % n) + n) % n;
}

export function createSliderGeometry(path: Vec2[], radius: number) {
  const halfCircleCount = getJoinGeometryCount(Math.PI);

  let numVertices = (path.length - 1) * 6 * 3 + halfCircleCount.vertices * 2;
  let numIndices = (path.length - 1) * 12 + halfCircleCount.indices * 2;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const theta = getTheta(prev, curr);
    const thetaNext = getTheta(curr, next);
    const thetaDiff = md(thetaNext - theta + Math.PI, Math.PI * 2) - Math.PI;

    const count = getJoinGeometryCount(thetaDiff);

    numVertices += count.vertices;
    numIndices += count.indices;
  }

  const geo = new GeometryBuilder(numVertices, numIndices);

  for (let i = 1; i < path.length; i++) {
    const curr = path[i];
    const prev = path[i - 1];
    const theta = getTheta(prev, curr);

    if (i === 1) geo.addJoin(prev, theta + Math.PI, Math.PI, radius);

    geo.addStraightSegment(prev, curr, radius);

    const next = path[i + 1];
    if (next) {
      const thetaNext = getTheta(curr, next);
      const thetaDiff = md(thetaNext - theta + Math.PI, Math.PI * 2) - Math.PI;

      geo.addJoin(curr, theta, thetaDiff, radius);
    } else {
      geo.addJoin(curr, theta, Math.PI, radius);
    }
  }

  return geo;
}
