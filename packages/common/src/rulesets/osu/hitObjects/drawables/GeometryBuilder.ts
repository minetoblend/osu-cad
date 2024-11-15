import { Vec2 } from 'osucad-framework';

export class GeometryBuilder {
  readonly vertices: Float32Array;
  readonly indices: Uint32Array;
  readonly uvs: Float32Array;

  travelDistance = 0;
  vertexCursor = 0;
  indexCursor = 0;

  constructor(
    numVertices: number,
    numIndices: number,
    readonly totalDistance: number,
  ) {
    this.vertices = new Float32Array(numVertices * 2);
    this.uvs = new Float32Array(numVertices * 2);
    this.indices = new Uint32Array(numIndices);
  }

  addVertex(
    x: number,
    y: number,
    z: number,
    distance: number = this.travelDistance,
  ) {
    const index = this.vertexCursor * 2;
    this.vertices[index] = x;
    this.vertices[index + 1] = y;
    this.uvs[index] = z;
    this.uvs[index + 1] = distance / this.totalDistance;
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
    const step = Math.PI / 24.0;

    const dir = Math.sign(thetaDiff);

    const absThetaDiff = Math.abs(thetaDiff);

    const amountPoints = Math.ceil(absThetaDiff / step);

    if (dir < 0.0) {
      theta += Math.PI;
    }

    const baseIndex = this.vertexCursor;
    this.addVertex(position.x, position.y, 0);

    for (let i = 0; i <= amountPoints; i++) {
      const angularOffset = Math.min(i * step, absThetaDiff);
      const angle = theta + dir * angularOffset;

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

    const cursor = this.vertexCursor;

    this.addVertex(from.x + dirLX, from.y + dirLY, 1.0, this.travelDistance);
    this.addVertex(from.x, from.y, 0.0, this.travelDistance);
    this.addVertex(from.x - dirLX, from.y - dirLY, 1.0, this.travelDistance);
    this.addVertex(
      to.x + dirLX,
      to.y + dirLY,
      1.0,
      this.travelDistance + length,
    );
    this.addVertex(to.x, to.y, 0.0, this.travelDistance + length);
    this.addVertex(
      to.x - dirLX,
      to.y - dirLY,
      1.0,
      this.travelDistance + length,
    );

    this.addTriangleIndices(cursor, cursor + 3, cursor + 1);
    this.addTriangleIndices(cursor + 3, cursor + 4, cursor + 1);
    this.addTriangleIndices(cursor + 1, cursor + 4, cursor + 5);
    this.addTriangleIndices(cursor + 5, cursor + 2, cursor + 1);

    this.travelDistance += length;
  }
}
