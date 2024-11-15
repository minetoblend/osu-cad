import type { Vec2 } from 'osucad-framework';
import type { PathPoint } from './PathPoint';
import type { PathType } from './PathType';

export class SliderPathBuilder {
  constructor(
    readonly controlPoints: PathPoint[] = [],
  ) {
  }

  get length() {
    return this.controlPoints.length;
  }

  get(index: number): PathPoint {
    return this.controlPoints[this.toIndex(index)];
  }

  set(index: number, point: PathPoint): this {
    index = this.toIndex(index);

    this.controlPoints[index] = point;

    return this;
  }

  setPosition(index: number, position: Vec2): this {
    index = this.toIndex(index);

    this.controlPoints[index] = this.controlPoints[index].withPosition(position);

    return this;
  }

  moveBy(index: number, offset: Vec2): this {
    index = this.toIndex(index);
    this.controlPoints[index] = this.controlPoints[index].moveBy(offset);

    return this;
  }

  setType(index: number, type: PathType | null): this {
    index = this.toIndex(index);

    this.controlPoints[index] = this.controlPoints[index].withType(type);

    return this;
  }

  insert(index: number, point: PathPoint): this {
    index = this.toIndex(index);

    this.controlPoints.splice(index, 0, point);

    return this;
  }

  append(point: PathPoint): this {
    this.controlPoints.push(point);

    return this;
  }

  remove(index: number): this {
    index = this.toIndex(index);

    this.controlPoints.splice(index, 1);

    return this;
  }

  setPath(path: PathPoint[]): this {
    this.controlPoints.splice(0, this.controlPoints.length, ...path);

    return this;
  }

  protected toIndex(index: number) {
    if (index < 0)
      return this.length + index;

    return index;
  }
}
