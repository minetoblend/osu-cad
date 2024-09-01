import type { DrawableOptions } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, DrawableSprite, EasingFunction } from 'osucad-framework';
import { Graphics } from 'pixi.js';
import { Easing } from 'osu-classes';

export class LoadingSpinner extends CompositeDrawable {
  constructor(options: DrawableOptions) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.with(options);

    this.addInternal(this.#graphicsContainer = new Container());

    this.#graphics = this.#graphicsContainer.drawNode.addChild(new Graphics());

    const radius = this.radius;
    this.transformTo('radius', radius, 1000, EasingFunction.OutExpo);
    this.#graphicsContainer.fadeInFromZero(600);

    this.#logo = new DrawableSprite({
      // TODO
      // texture: useAsset('texture:logo.with-text'),
      scale: 0.5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      y: 200,
    });

    this.#logo.fadeIn(500);
    this.#logo.moveToY(50, 1000, EasingFunction.OutExpo);

    this.addInternal(this.#logo);
  }

  readonly #logo: DrawableSprite;

  readonly #graphics: Graphics;

  readonly #graphicsContainer: Container;

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    this.#graphics.position.copyFrom(
      this.drawSize.scale(0.5).sub({ x: 0, y: 50 }),
    );
  }

  radius: number = 30;

  update() {
    super.update();

    const g = this.#graphics;

    function animate(time: number, offset = 0) {
      const t = (time / 1000 + offset) % 1;

      return (Easing.inOutCubic(t) * 0.5 + t * 0.5) * Math.PI * 2 + Math.PI * 1.5;
    }

    const startAngle = animate(this.time.current * 1.25);
    let endAngle = animate(this.time.current * 1.25, 0.3);

    if (endAngle < startAngle) {
      endAngle += Math.PI * 2;
    }

    g.clear()
      .arc(0, 0, this.radius, startAngle, endAngle)
      .stroke({
        color: 0x52CCA3,
        width: 6,
        cap: 'round',
      });
  }
}
