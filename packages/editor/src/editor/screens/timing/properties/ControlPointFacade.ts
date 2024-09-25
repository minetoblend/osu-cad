import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup';
import { Bindable, Component, dependencyLoader } from 'osucad-framework';

export class ControlPointFacade extends Component {
  constructor(initialControlPoints: ControlPointGroup[] = []) {
    super();
    this.#controlPoints = initialControlPoints;
  }

  readonly offsetBindable = new Bindable<number | 'mixed'>('mixed');

  #controlPoints: ControlPointGroup[] = [];

  get controlPoints() {
    return this.#controlPoints;
  }

  set controlPoints(value) {
    if (this.#controlPoints)
      this.unbindFrom(this.#controlPoints);

    this.#controlPoints = value;
    if (this.#controlPoints)
      this.bindTo(this.#controlPoints);
  }

  @dependencyLoader()
  load() {
    this.bindTo(this.controlPoints);
  }

  protected bindTo(controlPoints: ControlPointGroup[]) {
    for (const controlPoint of controlPoints)
      controlPoint.changed.addListener(this.#onControlPointChanged, this);
  }

  protected unbindFrom(controlPoints: ControlPointGroup[]) {
  }

  #onControlPointChanged() {
    this.scheduler.addOnce(this.#updateBindables, this);
  }

  #updateBindables() {

  }

  #getValueOrMixed<T>(getter: (c: ControlPointGroup) => T): T | 'Mixed' {
    if (this.controlPoints.length === 0)
      return 'Mixed';

    const value = getter(this.controlPoints[0]);

    for (let i = 1; i < this.controlPoints.length; i++) {
      if (value !== getter(this.controlPoints[i]))
        return 'Mixed';
    }

    return value;
  }
}
