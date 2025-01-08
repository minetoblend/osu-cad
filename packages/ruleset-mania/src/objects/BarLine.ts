import type { HitWindows } from '@osucad/common';
import { EmptyHitWindows } from '@osucad/common';
import { ManiaHitObject } from './ManiaHitObject';

export class BarLine extends ManiaHitObject {
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
