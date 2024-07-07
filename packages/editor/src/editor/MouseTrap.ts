import {
  Axes,
  CompositeDrawable,
  DrawableOptions,
  MouseButton,
  MouseDownEvent,
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

  isActive = true;

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
