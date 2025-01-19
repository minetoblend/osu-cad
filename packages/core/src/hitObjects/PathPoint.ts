import type { IVec2 } from '@osucad/framework';
import type { Matrix } from 'pixi.js';
import { Vec2 } from '@osucad/framework';
import { PathType } from './PathType';

export interface IPathPoint {
  position: IVec2;
  type: PathType | null;
}

export class PathPoint {
  constructor(
    readonly position: Vec2,
    readonly type: PathType | null = null,
  ) {
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  withPosition(position: Vec2) {
    return new PathPoint(position, this.type);
  }

  withType(type: PathType | null) {
    return new PathPoint(this.position, type);
  }

  clone() {
    return new PathPoint(this.position.clone(), this.type);
  }

  static linear(position: Vec2) {
    return new PathPoint(position, PathType.Linear);
  }

  moveBy(offset: Vec2) {
    return this.withPosition(this.position.add(offset));
  }

  transformBy(matrix: Matrix) {
    return this.withPosition(matrix.apply(this.position, new Vec2()));
  }

  toPlain(): IPathPoint {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      type: this.type,
    };
  }
}
