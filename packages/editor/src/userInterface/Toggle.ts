import type {
  Bindable,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  BindableWithCurrent,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FillMode,
  MouseButton,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { FastRoundedBox } from '../drawables/FastRoundedBox.ts';
import { ThemeColors } from '../editor/ThemeColors.ts';

export enum ToggleTrigger {
  Click,
  MouseDown,
}

export interface ToggleOptions {
  bindable?: Bindable<boolean>;
  trigger?: ToggleTrigger;
}

export class Toggle extends CompositeDrawable {
  constructor(options?: ToggleOptions) {
    super();

    if (options?.bindable)
      this.current = options.bindable;
    if (options?.trigger !== undefined)
      this.trigger = options.trigger;
  }

  trigger = ToggleTrigger.Click;

  @resolved(ThemeColors)
  protected colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.size = new Vec2(40, 18);

    this.addAllInternal(
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        color: 0x101012,
        alpha: 0.5,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 4,
        child: this.#movementContainer = new Container({
          relativeSizeAxes: Axes.Both,
          relativePositionAxes: Axes.X,
          fillMode: FillMode.Fit,
          child: this.#scaleContainer = new Container({
            relativeSizeAxes: Axes.Both,
            relativePositionAxes: Axes.X,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0.35,
            children: [
              this.#icon = new RoundedBox({
                relativeSizeAxes: Axes.Both,
                cornerRadius: 100,
                fillAlpha: 0,
                alpha: 1,
                outlines: [{
                  width: 2.5,
                  alignment: 1,
                  color: 0xFFFFFF,
                }],
                anchor: Anchor.Center,
                origin: Anchor.Center,
              }),
            ],
          }),
        }),
      }),
      this.#overlay = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        alpha: 0,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0xFFFFFF,
        blendMode: 'add',
      }),
    );

    this.current.valueChanged.addListener(this.#updateState, this);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#updateState();

    this.finishTransforms(true);
  }

  #background!: RoundedBox;

  #icon!: RoundedBox;

  #movementContainer!: Container;

  #scaleContainer!: Container;

  #overlay!: FastRoundedBox;

  readonly #current = new BindableWithCurrent(true);

  get current() {
    return this.#current.current;
  }

  set current(value: Bindable<boolean>) {
    this.#current.current = value;
  }

  get value() {
    return this.current.value;
  }

  set value(value: boolean) {
    this.current.value = value;
  }

  toggle() {
    this.value = !this.value;
  }

  #updateState() {
    if (this.value) {
      this.#scaleContainer
        .resizeTo(new Vec2(0.5, 1), 200, EasingFunction.OutExpo)
        .moveToX(-1, 200, EasingFunction.OutExpo)
        .fadeTo(1, 200, EasingFunction.OutExpo);
      this.#movementContainer.moveToX(1, 200, EasingFunction.OutExpo);
      this.#background
        .fadeColor(this.colors.primary, 200, EasingFunction.OutExpo)
        .fadeTo(1, 200, EasingFunction.OutExpo);
    }
    else {
      this.#scaleContainer
        .resizeTo(new Vec2(1), 200, EasingFunction.OutExpo)
        .moveToX(0, 200, EasingFunction.OutExpo)
        .fadeTo(0.35, 200, EasingFunction.OutExpo);
      this.#movementContainer.moveToX(0, 200, EasingFunction.OutExpo);
      this.#background.fadeColor(0x101012, 200, EasingFunction.OutExpo)
        .fadeTo(0.5, 200, EasingFunction.OutExpo);
    }
  }

  onHover() {
    this.#icon.scaleTo(1.1, 200, EasingFunction.OutExpo);

    this.#overlay.alpha = 0.05;

    return true;
  }

  onHoverLost() {
    this.#icon.scaleTo(1, 200, EasingFunction.OutExpo);

    this.#overlay.alpha = 0;
  }

  onClick(): boolean {
    if (this.trigger === ToggleTrigger.Click) {
      this.toggle();

      return true;
    }

    return false;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && this.trigger === ToggleTrigger.MouseDown) {
      this.toggle();

      return true;
    }

    return false;
  }
}
