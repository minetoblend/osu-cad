import type { Color } from 'pixi.js';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Axes, Bindable, ColorUtils, CompositeDrawable, dependencyLoader, FastRoundedBox } from 'osucad-framework';

export class TimelineHitObjectBody extends CompositeDrawable {
  constructor(readonly blueprint: TimelineHitObjectBlueprint) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  #body!: FastRoundedBox;

  protected accentColor = new Bindable<Color>(null!);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.#body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });
  }

  protected updateColors() {
    this.#body.color = ColorUtils.darken(this.accentColor.value, 0.25);
  }
}
