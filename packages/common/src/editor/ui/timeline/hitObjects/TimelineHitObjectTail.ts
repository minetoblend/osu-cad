import type { HoverEvent, HoverLostEvent, MouseDownEvent } from 'osucad-framework';
import type { Color } from 'pixi.js';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, Bindable, ColorUtils, CompositeDrawable, dependencyLoader, FastRoundedBox, FillMode, MouseButton } from 'osucad-framework';

export class TimelineHitObjectTail extends CompositeDrawable {
  constructor(readonly blueprint: TimelineHitObjectBlueprint) {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;
    this.anchor = Anchor.CenterRight;
    this.origin = Anchor.CenterRight;
  }

  #body!: FastRoundedBox;

  #outline!: FastRoundedBox;

  #hoverOverlay!: FastRoundedBox;

  protected get outline() {
    return this.#outline;
  }

  protected get body() {
    return this.#body;
  }

  protected accentColor = new Bindable<Color>(null!);

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
        scale: 0.85,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#hoverOverlay = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        alpha: 0,
      }),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });
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

  override onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }
}
