import type { Bindable, ScreenTransitionEvent } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { Anchor, Axes, Box, dependencyLoader, DrawableSprite, EasingFunction, FillMode, IRenderer } from 'osucad-framework';
import { BlurFilter, RenderTexture, Sprite } from 'pixi.js';
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
      this.blurredBackground = new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        fillMode: FillMode.Fill,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0,
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
      this.#updateTexture(texture.value);
      this.#updateBlurredTexture(texture.value);
    }, { immediate: true });
  }

  #updateTexture(texture: Texture | null) {
    this.background.texture = texture;
  }

  #updateBlurredTexture(texture: Texture | null) {
    const previous = this.#blurredTexture;

    if (texture)
      this.blurredBackground.texture = this.#blurredTexture = this.#createBlurredTexture(texture);
    else
      this.blurredBackground.texture = this.#blurredTexture = null;

    previous?.destroy();
  }

  #blurredTexture: RenderTexture | null = null;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(500, EasingFunction.OutExpo);
  }

  #createBlurredTexture(texture: Texture) {
    const renderer = this.dependencies.resolve(IRenderer);

    const renderTexture = RenderTexture.create({
      width: texture.width,
      height: texture.height,
    });

    const sprite = new Sprite({
      texture,
      filters: [
        new BlurFilter({
          strength: 15,
          quality: 4,
        }),
      ],
    });

    renderer.render({
      target: renderTexture,
      container: sprite,
    });

    sprite.destroy();

    return renderTexture;
  }
}
