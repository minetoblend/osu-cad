import type { ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import { DrawableHitObject, IScrollingInfo, ScrollingDirection } from '@osucad/core';
import { Anchor, Axes, Bindable, ColorUtils, CompositeDrawable, Container, FastRoundedBox, resolved, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { ArgonNotePiece } from './ArgonNotePiece';

export class ArgonHoldNoteTailPiece extends CompositeDrawable {
  static readonly NOTE_HEIGHT = 43;
  static readonly NOTE_ACCENT_RATIO = 0.82;
  static readonly CORNER_RADIUS = 3.4;

  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);
  private readonly accentColor = new Bindable(new Color());

  @resolved(DrawableHitObject, true)
  drawableHitObject?: DrawableHitObject;

  readonly #foreground: FastRoundedBox;

  readonly #additive: FastRoundedBox;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = ArgonNotePiece.NOTE_HEIGHT;

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
        alpha: 0.2,
        height: 0.9,
        cornerRadius: ArgonNotePiece.CORNER_RADIUS,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.BottomCenter,
        origin: Anchor.BottomCenter,
        height: ArgonNotePiece.NOTE_ACCENT_RATIO,
        children: [
          this.#foreground = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: ArgonNotePiece.CORNER_RADIUS,
          }),
          this.#additive = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: ArgonNotePiece.CORNER_RADIUS,
            blendMode: 'add',
            height: 0.5,
          }),
        ],
      }),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);
    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);
      this.accentColor.bindValueChanged(this.#onAccentChanged, this, true);

      this.drawableHitObject.hitObjectApplied.addListener(this.#hitObjectApplied, this);
    }
  }

  #hitObjectApplied(hitObject: DrawableHitObject) {

  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    this.scale = new Vec2(1, direction.value === ScrollingDirection.Up ? -1 : 1);
  }

  #onAccentChanged(color: ValueChangedEvent<Color>) {
    this.#foreground.color = ColorUtils.darkenSimple(color.value, 0.6);
    this.#additive.color = new Color(color.value).setAlpha(0.3);
  }
}
