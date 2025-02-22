import type { Drawable } from '@osucad/framework';
import { Bindable } from '@osucad/framework';

export interface OperatorPropertyOptions<T> {
  title: string;
  defaultValue: T | Bindable<T>;
  remember?: boolean;
}

export abstract class OperatorProperty<T> {
  protected constructor(options: OperatorPropertyOptions<T>) {
    const { title, defaultValue, remember } = options;

    this.title = title;
    this.remember = remember ?? false;
    this.bindable = defaultValue instanceof Bindable ? defaultValue : new Bindable(defaultValue);
  }

  readonly title: string;
  readonly remember: boolean;

  readonly bindable: Bindable<T>;

  get value() {
    return this.bindable.value;
  }

  set value(value) {
    this.bindable.value = value;
  }

  abstract createDrawableRepresentation(): Drawable;
}
