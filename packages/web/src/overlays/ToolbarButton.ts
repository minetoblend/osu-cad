import type { HoverEvent, HoverLostEvent } from '@osucad/framework';
import { Axes, BindableBoolean, CompositeDrawable, FastRoundedBox } from '@osucad/framework';

export abstract class ToolbarButton extends CompositeDrawable {
  protected constructor() {
    super();
    this.relativeSizeAxes = Axes.Y;
    this.autoSizeAxes = Axes.X;

    this.internalChildren = [
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
    ];
  }

  readonly #background: FastRoundedBox;

  readonly active = new BindableBoolean();

  override onHover(e: HoverEvent): boolean {
    this.#background.fadeTo(0.1, 100);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.fadeOut(100);
  }
}
