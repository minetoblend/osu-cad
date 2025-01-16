import type { ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import { DrawableHitObject, IScrollingInfo, ScrollingDirection } from '@osucad/core';
import { Anchor, Axes, Bindable, Box, ColorUtils, MaskingContainer } from '@osucad/framework';
import { Color } from 'pixi.js';

export class DefaultNotePiece extends MaskingContainer {
  static readonly NOTE_HEIGHT = 12;

  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);
  private readonly accentColor = new Bindable(new Color());

  #coloredBox!: Box;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = DefaultNotePiece.NOTE_HEIGHT;

    this.cornerRadius = 5;
    this.children = [
      new Box({
        relativeSizeAxes: Axes.Both,
      }),
      this.#coloredBox = new Box({
        relativeSizeAxes: Axes.X,
        height: DefaultNotePiece.NOTE_HEIGHT / 2,
        alpha: 0.1,
      }),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);

    const drawableObject = dependencies.resolveOptional(DrawableHitObject);

    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);

    if (drawableObject) {
      this.accentColor.bindTo(drawableObject.accentColor);
      this.accentColor.bindValueChanged(this.#onAccentChanged, this, true);
    }
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    this.#coloredBox.anchor = this.#coloredBox.origin = direction.value === ScrollingDirection.Up
      ? Anchor.TopCenter
      : Anchor.BottomCenter;
  }

  #onAccentChanged(color: ValueChangedEvent<Color>) {
    this.#coloredBox.color = ColorUtils.lighten(color.value, 0.25);
  }
}
