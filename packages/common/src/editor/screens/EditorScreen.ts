import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, CompositeDrawable } from 'osucad-framework';

export class EditorScreen extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  onEntering() {
    this.fadeInFromZero(200);
  }

  onExiting() {
    this.fadeOut(200);
  }

  protected get applySafeAreaPadding() {
    return true;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.applySafeAreaPadding)
      this.padding = { ...this.padding, bottom: 48 };
  }

  override get handlePositionalInput(): boolean {
    if (this.lifetimeEnd !== Number.MAX_VALUE)
      return false;

    return super.handlePositionalInput;
  }

  override get handleNonPositionalInput(): boolean {
    if (this.lifetimeEnd !== Number.MAX_VALUE)
      return false;

    return super.handleNonPositionalInput;
  }
}
