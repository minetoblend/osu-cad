import type { DrawableOptions } from '@osucad/framework';
import { BindableNumberWithCurrent, CompositeDrawable } from '@osucad/framework';

export interface SliderBarOptions extends DrawableOptions {
  current: BindableNumberWithCurrent;
}

export class SliderBar extends CompositeDrawable {
  constructor(options: SliderBarOptions) {
    super();

    this.with(options);
  }

  #current = new BindableNumberWithCurrent(0);

  get current() {
    return this.#current;
  }

  set current(value) {
    this.#current.current = value;
  }
}
