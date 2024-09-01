import { Action } from 'osucad-framework';
import { objectId } from '../ObjectId';
import { ControlPoint } from './ControlPoint';

export interface ControlPointGroupChangeEvent {
  group: ControlPointGroup;
  controlPoint: ControlPoint;
}

export class ControlPointGroup extends ControlPoint {
  id = objectId();

  constructor(startTime = 0) {
    super();

    this.time = startTime;
  }

  get time() {
    return super.time;
  }

  set time(value) {
    if (this.time === value)
      return;

    super.time = value;

    for (const child of this.children)
      child.time = value;
  }

  deepClone(): ControlPoint {
    const clone = new ControlPointGroup(this.time);

    clone.copyFrom(this);

    return clone;
  }

  #children = new Set<ControlPoint>();

  get children(): ReadonlySet<ControlPoint> {
    return this.#children;
  }

  copyFrom(other: this) {
    super.copyFrom(other);

    for (const child of other.children) {
      this.add(child.deepClone());
    }
  }

  added = new Action<ControlPointGroupChangeEvent>();

  removed = new Action<ControlPointGroupChangeEvent>();

  add(controlPoint: ControlPoint): boolean {
    if (this.#children.has(controlPoint))
      return false;

    for (const child of this.#children) {
      if (child.constructor === controlPoint.constructor) {
        this.remove(child);
        break;
      }
    }

    this.#children.add(controlPoint);

    this.added.emit({ group: this, controlPoint });

    controlPoint.time = this.time;

    return true;
  }

  remove(controlPoint: ControlPoint): boolean {
    if (!this.#children.delete(controlPoint))
      return false;

    this.removed.emit({ group: this, controlPoint });

    return true;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;
    if (!(existing instanceof ControlPointGroup))
      return false;

    return this.time === existing.time;
  }
}
