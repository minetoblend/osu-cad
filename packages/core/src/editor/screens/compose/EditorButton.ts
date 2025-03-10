import type { Drawable, FocusLostEvent, HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer, ScheduledDelegate } from '@osucad/framework';
import { Anchor, Axes, BindableBoolean, Box, CompositeDrawable, Container, DrawableSprite, EasingFunction, isSourcedFromTouch, MouseButton, Vec2, Visibility } from '@osucad/framework';
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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.backgroundContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        cornerRadius: 8,
        children: [
          this.#background = new Box({
            relativeSizeAxes: Axes.Both,
            color: OsucadColors.translucent,
            alpha: 0.8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
          this.#outlineContainer = new Container({
            relativeSizeAxes: Axes.Both,
            child: this.#outline = new Container({
              relativeSizeAxes: Axes.Both,
              anchor: Anchor.Center,
              origin: Anchor.Center,
              masking: true,
              cornerRadius: 10,
              borderColor: OsucadColors.primary,
              child: new Box({
                relativeSizeAxes: Axes.Both,
                alpha: 0,
                alwaysPresent: true,
              }),
            }),
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

  #background!: Box;

  #outline!: Container;

  #outlineContainer!: Container;

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

    if (this.active.value) {
      this.#outlineContainer.transformPadding(-2, this.outlineTransitionDuration);
      this.#outline.transformTo('borderThickness', 2.5, this.outlineTransitionDuration);
    }
    else {
      this.#outlineContainer.transformPadding(0, this.outlineTransitionDuration);
      this.#outline.transformTo('borderThickness', 0, this.outlineTransitionDuration);
    }
  }

  protected get outlineTransitionDuration() {
    return 120;
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

  override get requestsPositionalInput(): boolean {
    return super.requestsPositionalInput && !this.disabled.value;
  }

  showSubmenu() {
    this.getContainingFocusManager()?.changeFocus(this);
    this.#submenu?.show();
  }

  override onFocusLost(e: FocusLostEvent) {
    this.#submenu?.hide();
  }
}
