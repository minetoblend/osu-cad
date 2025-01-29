import type { BindableNumber, ClickEvent, DragEvent, DragStartEvent, FocusEvent, FocusLostEvent, HoverEvent, HoverLostEvent, KeyDownEvent, MouseDownEvent, MouseEvent, MouseUpEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import { Anchor, Axes, BindableNumberWithCurrent, CompositeDrawable, Container, EasingFunction, FastRoundedBox, Key, MouseButton, TabbableContainer, Vec2 } from '@osucad/framework';

import { OsucadColors } from '../../OsucadColors';
import { ITabbableContentContainer } from './ITabbableContentContainer';

export class SliderBar extends TabbableContainer {
  constructor(value?: BindableNumber) {
    super();

    this.height = 20;
    this.relativeSizeAxes = Axes.X;

    this.padding = { horizontal: 10 };

    this.internalChildren = [
      this.track = new Container({
        relativeSizeAxes: Axes.X,
        height: 4,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        alpha: 0.1,
        padding: { left: 14, right: -10 },
        child: new FastRoundedBox({
          relativeSizeAxes: Axes.X,
          height: 4,
          cornerRadius: 2,
          color: 0xFFFFFF,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
      this.activeTrack = new Container({
        relativeSizeAxes: Axes.X,
        height: 4,
        padding: { right: 14, left: -10 },
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        alpha: 0.4,
        child: new FastRoundedBox({
          relativeSizeAxes: Axes.Both,
          cornerRadius: 2,
          color: OsucadColors.primary,
        }),
      }),
      this.thumb = new Thumb().with({
        relativePositionAxes: Axes.X,
      }),
    ];

    if (value)
      this.currentNumber = value;
  }

  readonly track: Container;
  readonly activeTrack: Container;
  readonly thumb: Thumb;

  readonly #currentNumber = new BindableNumberWithCurrent(0);

  get currentNumber(): BindableNumber {
    return this.#currentNumber.current;
  }

  set currentNumber(value: BindableNumber) {
    this.#currentNumber.current = value;
  }

  #customStepSize: number | null = null;

  get stepSize() {
    return this.#customStepSize ?? this.currentNumber.precision;
  }

  set stepSize(value: number) {
    this.#customStepSize = value;
  }

  withStepSize(value: number): this {
    this.stepSize = value;
    return this;
  }

  get normalizedValue() {
    if (!this.currentNumber.hasDefinedRange)
      throw new Error('A SliderBar must have a pre-defined min/max range.');

    return this.currentNumber.normalizedValue;
  }

  override get canBeTabbedTo(): boolean {
    return !this.currentNumber.disabled;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.tabbableContentContainer = dependencies.resolveOptional(ITabbableContentContainer) ?? null;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.currentNumber.bindValueChanged(() => {
      this.thumb.moveToX(this.normalizedValue, 200, EasingFunction.OutExpo);
      this.activeTrack.resizeWidthTo(this.normalizedValue, 200, EasingFunction.OutExpo);
      this.track.resizeWidthTo(1 - this.normalizedValue, 200, EasingFunction.OutExpo);
    }, true);
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    this.track.child.alpha = this.track.childSize.x <= 0 ? 0 : 1;
    this.activeTrack.child.alpha = this.activeTrack.childSize.x <= 0 ? 0 : 1;
  }

  updateFromEvent(e: MouseEvent) {
    this.currentNumber.value = this.currentNumber.minValue + (e.mousePosition.x - this.padding.left) / this.childSize.x * (this.currentNumber.maxValue - this.currentNumber.minValue);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.getContainingFocusManager()?.changeFocus(this);

      this.updateFromEvent(e);
      this.thumb.scaleTo(1.1, 200, EasingFunction.OutExpo);
      return true;
    }

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.thumb.scaleTo(1, 200, EasingFunction.OutBack);
    }
  }

  override onDragStart(e: DragStartEvent): boolean {
    this.updateFromEvent(e);

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.updateFromEvent(e);
    return true;
  }

  override get acceptsFocus(): boolean {
    return true;
  }

  override onFocus(e: FocusEvent) {
    this.activeTrack.fadeTo(1, 200);
    this.track.fadeTo(0.2, 200);
  }

  override onFocusLost(e: FocusLostEvent) {
    this.activeTrack.fadeTo(0.4, 200, EasingFunction.OutCubic);
    this.track.fadeTo(0.1, 200);
  }

  override onClick(e: ClickEvent): boolean {
    return true;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (!this.hasFocus)
      return false;

    switch (e.key) {
      case Key.ArrowLeft:
        this.currentNumber.value = this.currentNumber.value - this.stepSize * (e.shiftPressed ? 10 : 1);
        return true;

      case Key.ArrowRight:
        this.currentNumber.value = this.currentNumber.value + this.stepSize * (e.shiftPressed ? 10 : 1);
        return true;
    }

    return super.onKeyDown(e);
  }
}

class Thumb extends CompositeDrawable {
  constructor() {
    super();

    this.size = new Vec2(20, 12);
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;

    this.internalChildren = [
      this.focusRing = new Container({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        child: new FastRoundedBox({
          relativeSizeAxes: Axes.Both,
          cornerRadius: 10,
          color: OsucadColors.primary,
        }),
      }),
      this.background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 8,
        color: OsucadColors.primary,
      }),
    ];
  }

  readonly background: FastRoundedBox;
  readonly focusRing: Container;

  override onHover(e: HoverEvent): boolean {
    this.background.fadeColor(OsucadColors.primaryHighlight);

    return false;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.background.fadeColor(OsucadColors.primary, 200);
  }

  showFocusRing() {
    this.focusRing.transformPadding(-3, 200, EasingFunction.OutExpo);
    this.focusRing.fadeTo(0.2, 200);
  }

  hideFocusRing() {
    this.focusRing.transformPadding(3, 200, EasingFunction.OutExpo);
    this.focusRing.fadeOut(200);
  }
}
