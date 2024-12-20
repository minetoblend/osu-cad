import {
  BindableBoolean,
  type Drawable,
  type HoverEvent,
  type HoverLostEvent,
  type MouseDownEvent,
  type MouseUpEvent,
} from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader, EasingFunction, FastRoundedBox, MouseButton, RoundedBox, Vec2 } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';

export abstract class ToolbarButton extends CompositeDrawable {
  static readonly SIZE = 54;

  protected constructor() {
    super();

    this.size = new Vec2(ToolbarButton.SIZE);
  }

  readonly active = new BindableBoolean();

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.backgroundContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          this.#background = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            color: OsucadColors.translucent,
            alpha: 0.8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
          this.#outline = new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            fillAlpha: 0,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
        ],
      }),
      (this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      })),
      this.scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        child: this.createContent(),
      }),
    );

    this.active.valueChanged.addListener(this.updateState, this);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.updateState();
  }

  protected backgroundContainer!: Container;

  protected scaleContainer!: Container;

  #background!: FastRoundedBox;

  #outline!: RoundedBox;

  #content!: Container;

  protected abstract createContent(): Drawable;

  #buttonPressed = false;

  protected get armed() {
    return this.#buttonPressed;
  }

  protected updateState() {
    if (this.armed) {
      this.scaleContainer.scaleTo(0.85, 300, EasingFunction.OutQuart);
      this.backgroundContainer.scaleTo(0.95, 300, EasingFunction.OutQuart);
    }
    else {
      this.scaleContainer.scaleTo(1, 300, EasingFunction.OutBack);
      this.backgroundContainer.scaleTo(1, 300, EasingFunction.OutBack);
    }

    if (this.active.value) {
      this.transformTo('outlineVisibility', 1, 200);
    }
    else {
      this.transformTo('outlineVisibility', 0, 200);
    }
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#buttonPressed = true;
      this.updateState();
      return true;
    }

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.#buttonPressed = false;
      this.updateState();
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.updateState();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.updateState();
  }

  #outlineVisibility = 0;

  get outlineVisibility() {
    return this.#outlineVisibility;
  }

  set outlineVisibility(value: number) {
    if (value === this.#outlineVisibility)
      return;

    this.#outlineVisibility = value;
    this.#outline.alpha = value;

    this.#outline.drawNode.visible = value > 0;

    this.#updateOutline();
  }

  #updateOutline() {
    if (this.outlineVisibility === 0) {
      this.#outline.outlines = [];
    }
    else {
      this.#outline.outlines = [
        {
          color: 0xC0BFBD,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32D2AC,
          width: 1.5 * this.outlineVisibility,
          alpha: this.outlineVisibility,
          alignment: 0,
        },
      ];
    }
  }
}
