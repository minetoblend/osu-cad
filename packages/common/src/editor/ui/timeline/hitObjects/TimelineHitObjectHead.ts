import type { HoverEvent, HoverLostEvent } from 'osucad-framework';
import type { Color } from 'pixi.js';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, Bindable, ColorUtils, CompositeDrawable, dependencyLoader, FastRoundedBox, FillMode } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';

export class TimelineHitObjectHead extends CompositeDrawable {
  constructor(readonly blueprint: TimelineHitObjectBlueprint) {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;
  }

  #outline!: FastRoundedBox;

  #body!: FastRoundedBox;

  #hoverOverlay!: FastRoundedBox;

  protected accentColor = new Bindable<Color>(null!);

  #comboNumber!: OsucadSpriteText;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.#outline = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.85,
      }),
      this.#hoverOverlay = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        alpha: 0,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#comboNumber = new OsucadSpriteText({
        text: '1',
        fontSize: 14,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });

    this.blueprint.indexInComboBindable.addOnChangeListener(() => this.#updateComboNumber(), { immediate: true });
  }

  protected updateColors() {
    this.#outline.color = ColorUtils.darken(this.accentColor.value, 0.25);
    this.#body.color = this.accentColor.value;
  }

  override onHover(e: HoverEvent): boolean {
    this.#hoverOverlay.alpha = 0.35;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#hoverOverlay.alpha = 0;
  }

  #updateComboNumber() {
    this.#comboNumber.text = (this.blueprint.indexInComboBindable.value + 1).toString();
  }
}
