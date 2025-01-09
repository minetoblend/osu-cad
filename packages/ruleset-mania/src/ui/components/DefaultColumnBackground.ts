import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer, ValueChangedEvent } from 'osucad-framework';
import { IScrollingInfo, ScrollingDirection, SliderGradient } from '@osucad/common';
import { Anchor, Axes, Bindable, Box, ColorUtils, CompositeDrawable, DrawableSprite, EasingFunction, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { Column } from '../Column';
import { ManiaAction } from '../ManiaAction';

export class DefaultColumnBackground extends CompositeDrawable implements IKeyBindingHandler<ManiaAction> {
  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  #brightColor!: Color;
  #dimColor!: Color;

  #background!: Box;
  #backgroundOverlay!: DrawableSprite;

  @resolved(() => Column)
  private column!: Column;

  private readonly accentColor = new Bindable(new Color(0xFFFFFF));

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      this.#background = new Box({
        label: 'Background',
        relativeSizeAxes: Axes.Both,
      }),
      this.#backgroundOverlay = new DrawableSprite({
        label: 'Background Gradient Overlay',
        relativeSizeAxes: Axes.Both,
        height: 0.5,
        blendMode: 'add',
        alpha: 0,
      }),
    ];

    this.accentColor.bindTo(this.column.accentColor);
    this.accentColor.bindValueChanged((color) => {
      this.#background.color = ColorUtils.darken(color.value, 1 - 1 / 6);
      this.#brightColor = new Color(color.value).setAlpha(0.6);
      this.#dimColor = new Color(color.value).setAlpha(0);
    }, true);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);

    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    const gradient = new SliderGradient(0, 0, 0, 1);

    if (direction.value === ScrollingDirection.Up) {
      this.#backgroundOverlay.anchor = this.#backgroundOverlay.origin = Anchor.TopLeft;
      gradient.addColorStop(0, this.#brightColor, this.#brightColor.alpha);
      gradient.addColorStop(1, this.#dimColor, this.#dimColor.alpha);
    }
    else {
      this.#backgroundOverlay.anchor = this.#backgroundOverlay.origin = Anchor.BottomLeft;
      gradient.addColorStop(0, this.#dimColor, this.#dimColor.alpha);
      gradient.addColorStop(1, this.#brightColor, this.#brightColor.alpha);
    }

    gradient.buildLinearGradient();

    this.#backgroundOverlay.texture?.destroy(true);

    this.#backgroundOverlay.texture = gradient.texture;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#backgroundOverlay.texture?.destroy(true);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (e.pressed === this.column.action.value) {
      this.#backgroundOverlay.fadeTo(1, 50, EasingFunction.OutQuint)
        .then()
        .fadeTo(0.5, 250, EasingFunction.OutQuint);
    }
    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<ManiaAction>) {
    if (e.pressed === this.column.action.value) {
      this.#backgroundOverlay.fadeTo(0, 250, EasingFunction.OutQuint);
    }
  }
}
