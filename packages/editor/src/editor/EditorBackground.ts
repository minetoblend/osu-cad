import type { Bindable, ScreenTransitionEvent } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader, DrawableSprite, EasingFunction, FillMode } from 'osucad-framework';
import { BackgroundScreen } from '../BackgroundScreen.ts';

export class EditorBackground extends BackgroundScreen {
  constructor(background: Bindable<Texture | null>) {
    super();
    this.#background = background.getBoundCopy();
  }

  readonly #background: Bindable<Texture | null>;

  background!: DrawableSprite;

  blurredBackground!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
    this.relativePositionAxes = Axes.Both;

    this.addAllInternal(
      new Box({
        color: 0x00000,
        relativeSizeAxes: Axes.Both,
      }),
      this.background = new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        fillMode: FillMode.Fill,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.75,
      }),
    );

    this.#background.addOnChangeListener((texture) => {
      this.background.texture = texture.value;
    }, { immediate: true });
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(500, EasingFunction.OutExpo);
  }
}
