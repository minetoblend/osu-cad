import { Vec2 } from 'osucad-framework';
import { PathType, SerializedPathPoint } from '../types';
import { Matrix } from 'pixi.js';

export class PathPoint {
  constructor(
    readonly position: Vec2,
    readonly type: PathType | null = null,
  ) {}

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

  serialize(): SerializedPathPoint {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
    };
  }

  static deserialize(data: SerializedPathPoint) {
    return new PathPoint(new Vec2(data.x, data.y), data.type);
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

  toJSON() {
    return this.serialize();
  }
}
