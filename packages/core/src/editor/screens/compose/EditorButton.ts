import type { Drawable, FocusLostEvent, HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent, ScheduledDelegate } from '@osucad/framework';
import { Anchor, Axes, BindableBoolean, CompositeDrawable, Container, dependencyLoader, DrawableSprite, EasingFunction, FastRoundedBox, isSourcedFromTouch, MouseButton, RoundedBox, Vec2, Visibility } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadColors } from '../../../OsucadColors';
import { EditorButtonSubmenu } from './EditorButtonSubmenu';

export abstract class EditorButton extends CompositeDrawable {
  static readonly SIZE = 54;

  protected constructor(
    childButtons?: EditorButton[],
  ) {
    super();

    this.size = new Vec2(EditorButton.SIZE);

    if (childButtons && childButtons.length) {
      this.doWhenLoaded(() => {
        this.addInternal(this.#submenu = new EditorButtonSubmenu(childButtons).with({
          depth: 1,
        }));
        this.backgroundContainer.add(
          new DrawableSprite({
            texture: getIcon('submenu-caret'),
            size: 10,
            position: new Vec2(-4),
            color: OsucadColors.text,
            anchor: Anchor.BottomRight,
            origin: Anchor.BottomRight,
          }),
        );
      });
    }
  }

  #submenu?: EditorButtonSubmenu;

  readonly active = new BindableBoolean();

  readonly disabled = new BindableBoolean();

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
    this.disabled.valueChanged.addListener(this.updateState, this);
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
    if (this.disabled.value) {
      this.backgroundContainer.alpha = 0.5;
      this.#content.alpha = 0.5;
    }
    else {
      this.backgroundContainer.alpha = 1;
      this.#content.alpha = 1;
    }

    if (this.armed) {
      this.scaleContainer.scaleTo(0.85, 300, EasingFunction.OutQuart);
      this.backgroundContainer.scaleTo(0.95, 300, EasingFunction.OutQuart);
    }
    else {
      this.scaleContainer.scaleTo(1, 300, EasingFunction.OutBack);
      this.backgroundContainer.scaleTo(1, 300, EasingFunction.OutBack);
    }

    this.transformTo('outlineVisibility', this.active.value ? 1 : 0, this.outlineTransitionDuration);
  }

  protected get outlineTransitionDuration() {
    return 200;
  }

  override get acceptsFocus(): boolean {
    return true;
  }

  #longPressDelegate?: ScheduledDelegate;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#buttonPressed = true;
      this.updateState();

      this.#longPressDelegate?.cancel();
      this.#longPressDelegate = this.scheduler.addDelayed(() => this.showSubmenu(), 400);
    }

    if (e.button === MouseButton.Right) {
      if (this.#submenu?.state.value === Visibility.Hidden)
        this.showSubmenu();
      else if (!isSourcedFromTouch(e.state.mouse.lastSource))
        this.#submenu?.hide();
    }

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.#buttonPressed = false;
      this.updateState();
      this.#longPressDelegate?.cancel();
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

  override get requestsPositionalInput(): boolean {
    return super.requestsPositionalInput && !this.disabled.value;
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

  showSubmenu() {
    this.getContainingFocusManager()?.changeFocus(this);
    this.#submenu?.show();
  }

  override onFocusLost(e: FocusLostEvent) {
    this.#submenu?.hide();
  }
}
