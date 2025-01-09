import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer, ValueChangedEvent } from 'osucad-framework';
import type { Color } from 'pixi.js';
import { IScrollingInfo, ScrollingDirection, SliderGradient } from '@osucad/common';
import { Anchor, Axes, Bindable, CompositeDrawable, Container, DrawableSprite, EasingFunction, FastRoundedBox, resolved, RoundedBox } from 'osucad-framework';
import { BlurFilter } from 'pixi.js';
import { Column } from '../Column';
import { ManiaAction } from '../ManiaAction';
import { Stage } from '../Stage';

const key_icon_size = 10;
const key_icon_corner_radius = 3;

export class DefaultKeyArea extends CompositeDrawable implements IKeyBindingHandler<ManiaAction> {
  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  #directionContainer!: Container;
  #keyIcon!: Drawable;
  #keyIconOutline!: Drawable;
  #gradient!: DrawableSprite;

  private accentColor!: Bindable<Color>;

  @resolved(() => Column)
  private column!: Column;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);

    this.internalChild = this.#directionContainer = new Container({
      relativeSizeAxes: Axes.X,
      height: Stage.HIT_TARGET_POSITION,
      children: [
        this.#gradient = new DrawableSprite({
          label: 'Key gradient',
          relativeSizeAxes: Axes.Both,
          alpha: 0.5,
        }),
        this.#keyIcon = new FastRoundedBox({
          label: 'Key icon',
          size: key_icon_size,
          origin: Anchor.Center,
          cornerRadius: key_icon_corner_radius,
          filters: [
            new BlurFilter({
              quality: 3,
              strength: 5,
              blendMode: 'add',
            }),
          ],
        }),
        this.#keyIconOutline = new RoundedBox({
          label: 'Key icon',
          size: key_icon_size,
          origin: Anchor.Center,
          cornerRadius: key_icon_corner_radius,
          fillAlpha: 0,
          outline: {
            width: 2,
            color: 0xFFFFFF,
          },
        }),
      ],
    });

    this.direction.bindTo(scrollingInfo.direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);

    this.accentColor = this.column.accentColor.getBoundCopy();
    this.accentColor.bindValueChanged((color) => {
      this.#keyIcon.color = color.value;
    }, true);
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    const gradient = new SliderGradient(0, 0, 0, 1);

    if (direction.value === ScrollingDirection.Up) {
      this.#keyIcon.anchor = this.#keyIconOutline.anchor = Anchor.BottomCenter;
      this.#keyIcon.y = this.#keyIconOutline.y = -20;
      this.#directionContainer.anchor = this.#directionContainer.origin = Anchor.TopLeft;
      gradient.addColorStop(1, 0x000000, 0);
      gradient.addColorStop(0, 0x000000, 1);
    }
    else {
      this.#keyIcon.anchor = this.#keyIconOutline.anchor = Anchor.TopCenter;
      this.#keyIcon.y = this.#keyIconOutline.y = 20;
      this.#directionContainer.anchor = this.#directionContainer.origin = Anchor.BottomLeft;
      gradient.addColorStop(1, 0x000000, 1);
      gradient.addColorStop(0, 0x000000, 0);
    }
    gradient.buildLinearGradient();

    this.#gradient.texture?.destroy(true);
    this.#gradient.texture = gradient.texture;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (e.pressed === this.column.action.value) {
      console.log('pressed');
      this.#keyIcon.scaleTo(1.4, 50, EasingFunction.OutQuint)
        .then()
        .scaleTo(1.3, 250, EasingFunction.OutQuint);

      this.#keyIconOutline.scaleTo(1.4, 50, EasingFunction.OutQuint)
        .then()
        .scaleTo(1.3, 250, EasingFunction.OutQuint);
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<ManiaAction>) {
    if (e.pressed === this.column.action.value) {
      this.#keyIcon.scaleTo(1.4, 50, EasingFunction.OutQuint)
        .then()
        .scaleTo(1, 125, EasingFunction.OutQuint);

      this.#keyIconOutline.scaleTo(1.4, 50, EasingFunction.OutQuint)
        .then()
        .scaleTo(1, 125, EasingFunction.OutQuint);
    }
  }
}
