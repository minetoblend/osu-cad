import type { ValueChangedEvent } from '@osucad/framework';
import { HitObject } from '@osucad/core';
import { BindableNumber } from '@osucad/framework';

export class ManiaHitObject extends HitObject {
  constructor() {
    super();

    this.#column.bindable.valueChanged.addListener(this.onColumnChanged, this);
  }

  readonly #column = this.property(
    'column',
    new BindableNumber(0)
      .withPrecision(1)
      .withMinValue(0),
  );

  get columnBindable() {
    return this.#column.bindable;
  }

  get column() {
    return this.#column.value;
  }

  set column(value) {
    this.#column.value = value;
  }

  protected onColumnChanged(column: ValueChangedEvent<number>) {
  }

  override isVisibleAtTime(time: number): boolean {
    return false;
  }
}
