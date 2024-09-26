import type { Bindable, ScreenTransitionEvent } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader, DrawableSprite, EasingFunction, FillMode } from 'osucad-framework';
import { BackgroundScreen } from '../BackgroundScreen.ts';

export class EditorBackground extends BackgroundScreen {
  constructor(background: Bindable<Texture | null>) {
    super();
    this.background = background.getBoundCopy();
  }

  readonly background: Bindable<Texture | null>;

  #sprite!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
    this.relativePositionAxes = Axes.Both;

    this.addInternal(new Box({
      color: 0x00000,
      relativeSizeAxes: Axes.Both,
    }));

    this.addInternal(this.#sprite = new DrawableSprite({
      texture: this.background.value,
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      alpha: 0.75,
    }));

    this.background.valueChanged.addListener(texture => this.#sprite.texture = texture.value);
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(500, EasingFunction.OutExpo);
  }
}
