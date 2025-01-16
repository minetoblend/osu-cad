import type { HitWindows, IBarLine } from '@osucad/core';
import { EmptyHitWindows } from '@osucad/core';
import { ManiaHitObject } from './ManiaHitObject';

export class BarLine extends ManiaHitObject implements IBarLine {
  constructor(startTime: number = 0, major: boolean = false) {
    super();

    this.startTime = startTime;
    this.major = major;
  }

  readonly #major = this.property('major', false);

  get majorBindable() {
    return this.#major.bindable;
  }

  get major() {
    return this.#major.value;
  }

  set major(value) {
    this.#major.value = value;
  }

  protected override createHitWindows(): HitWindows {
    return new EmptyHitWindows();
  }
}
