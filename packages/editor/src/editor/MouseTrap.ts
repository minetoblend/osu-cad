import type {
  DrawableOptions,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Axes,
  CompositeDrawable,
  MouseButton,
} from 'osucad-framework';

export interface MouseTrapOptions extends DrawableOptions {
  action: () => void;
  isActive?: boolean;
}

export class MouseTrap extends CompositeDrawable {
  constructor(options: MouseTrapOptions) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.apply(options);
  }

  get isActive() {
    return this.alpha > 0;
  }

  set isActive(value: boolean) {
    this.alpha = value ? 1 : 0;
  }

  action!: () => void;

  handle(): boolean {
    return this.isActive;
  }

  onClick(e: MouseDownEvent): boolean {
    if (this.isActive && e.button === MouseButton.Left) {
      this.action();
      return true;
    }

    return false;
  }
}
