import type { Color } from 'pixi.js';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, Bindable, ColorUtils, CompositeDrawable, dependencyLoader, FastRoundedBox, FillMode, resolved } from 'osucad-framework';
import { Timeline } from '../Timeline';

export class TimelineRepeatPiece extends CompositeDrawable {
  constructor(
    readonly blueprint: TimelineHitObjectBlueprint,
    readonly hitObject: HitObject,
  ) {
    super();
  }

  #outline!: FastRoundedBox;

  #body!: FastRoundedBox;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;

    this.addAllInternal(
      this.#outline = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.65,
      }),

      this.#body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        scale: 0.5,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });
  }

  protected accentColor = new Bindable<Color>(null!);

  protected updateColors() {
    this.#outline.color = ColorUtils.darken(this.accentColor.value, 0.25);
    this.#body.color = this.accentColor.value;
  }

  @resolved(Timeline)
  timeline!: Timeline;
}
