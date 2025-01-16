import type { Drawable, ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import { DrawableHitObject, IScrollingInfo, LinearGradient, ScrollingDirection } from '@osucad/core';
import { Anchor, Axes, Bindable, Box, DrawableSprite, FastRoundedBox, MaskingContainer, resolved, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { Color } from 'pixi.js';

const gradient = new LinearGradient(0, 0, 0, 1);
gradient.addColorStop(0, 0x000000, 0);
gradient.addColorStop(1, 0x000000, 1);
gradient.buildLinearGradient();
gradient.texture.source.style.wrapMode = 'clamp-to-edge';

export class ArgonNotePiece extends MaskingContainer {
  static readonly NOTE_HEIGHT = 43;
  static readonly NOTE_ACCENT_RATIO = 0.82;
  static readonly CORNER_RADIUS = 3.4;

  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);
  private readonly accentColor = new Bindable(new Color());

  @resolved(DrawableHitObject, true)
  drawableHitObject?: DrawableHitObject;

  readonly #coloredBox: Drawable;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = ArgonNotePiece.NOTE_HEIGHT;

    this.cornerRadius = ArgonNotePiece.CORNER_RADIUS;
    this.children = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        alpha: 0.25,
      }),
      this.#coloredBox = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        height: ArgonNotePiece.NOTE_ACCENT_RATIO,
        cornerRadius: ArgonNotePiece.CORNER_RADIUS,
      }),
      new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        height: ArgonNotePiece.CORNER_RADIUS * 2,
        cornerRadius: ArgonNotePiece.CORNER_RADIUS,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      }),
      this.createIcon(),
    ];
  }

  protected createIcon(): Drawable {
    return new DrawableSprite({
      texture: getIcon('caret-left'),
      rotation: -Math.PI / 2,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      y: 4,
      size: 28,
      scale: new Vec2(0.7, 1),
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);
    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);
      this.accentColor.bindValueChanged(this.#onAccentChanged, this, true);
    }
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    this.#coloredBox.anchor = this.#coloredBox.origin = direction.value === ScrollingDirection.Up
      ? Anchor.TopCenter
      : Anchor.BottomCenter;

    this.scale = new Vec2(1, direction.value === ScrollingDirection.Up ? -1 : 1);
  }

  #onAccentChanged(color: ValueChangedEvent<Color>) {
    this.#coloredBox.color = color.value;
  }
}
