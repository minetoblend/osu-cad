import {MeshGeometry} from "pixi.js";
import {Vec2} from "@osucad/common";
import {GeometryBuilder} from "./GeometryBuilder.ts";

interface SliderPathGeometryOptions {
  path: Vec2[];
  radius: number;
  expectedDistance: number;
}

export class SliderPathGeometry extends MeshGeometry {

  constructor(options: SliderPathGeometryOptions) {
    const {path, radius, expectedDistance} = options;
    super({
      positions: new Float32Array(0),
      indices: new Uint32Array(0),
    });

    const geo = this.generatePath(path, radius, expectedDistance);

    this.positions = geo.vertices;
    this.indices = geo.indices;
    this.uvs = geo.uvs;
  }


  private generatePath(path: Vec2[], radius: number, expectedDistance: number) {
    const {numVertices, numIndices} = this.getGeoCount(path);
    const geo = new GeometryBuilder(numVertices, numIndices, expectedDistance);

    for (let i = 1; i < path.length; i++) {
      const curr = path[i];
      const prev = path[i - 1];
      const theta = this.getTheta(prev, curr);

      if (i === 1) geo.addJoin(prev, theta + Math.PI, Math.PI, radius);

      geo.addStraightSegment(prev, curr, radius);

      const next = path[i + 1];
      if (next) {
        const thetaNext = this.getTheta(curr, next);
        const thetaDiff = this.md(thetaNext - theta + Math.PI, Math.PI * 2) - Math.PI;

        geo.addJoin(curr, theta, thetaDiff, radius);
      } else {
        //geo.addJoin(curr, theta, Math.PI, radius);
      }
    }

    return geo;
  }

  private getGeoCount(path: Vec2[]) {
    const halfCircleCount = this.getJoinGeometryCount(Math.PI);

    let numVertices = (path.length - 1) * 6 * 3 + halfCircleCount.vertices * 2;
    let numIndices = (path.length - 1) * 12 + halfCircleCount.indices * 2;

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      const theta = this.getTheta(prev, curr);
      const thetaNext = this.getTheta(curr, next);
      const thetaDiff = this.md(thetaNext - theta + Math.PI, Math.PI * 2) - Math.PI;

      const count = this.getJoinGeometryCount(thetaDiff);

      numVertices += count.vertices;
      numIndices += count.indices;
    }

    return {
      numVertices: numVertices / 3,
      numIndices,
    };
  }

  private md(a: number, n: number): number {
    return ((a % n) + n) % n;
  }

  private getTheta(from: Vec2, to: Vec2) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  private getJoinGeometryCount(thetaDiff: number) {
    let step = Math.PI / 24.0;

    let absThetaDiff = Math.abs(thetaDiff);

    const amountOfOuterPoints = Math.ceil(absThetaDiff / step) + 1;

    return {
      vertices: (amountOfOuterPoints + 1) * 3,
      indices: (amountOfOuterPoints - 1) * 3,
    };
  }

  update(
    path: Vec2[],
    radius: number,
    expectedDistance: number,
  ) {
    const geo = this.generatePath(path, radius, expectedDistance);

    this.positions = geo.vertices;
    this.indices = geo.indices;

    this.uvs = geo.uvs;
    this['_boundsDirty'] = true;
  }


}
