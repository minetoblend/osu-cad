import type { DrawableOptions } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, DrawableSprite } from 'osucad-framework';
import { Graphics } from 'pixi.js';
import { Easing } from 'osu-classes';
import gsap from 'gsap';

export class LoadingSpinner extends CompositeDrawable {
  constructor(options: DrawableOptions) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.apply(options);

    this.#graphics = this.drawNode.addChild(new Graphics({

    }));

    gsap.from(this, {
      radius: 0,
      duration: 1,
      ease: 'expo.out',
    });

    gsap.from(this.#graphics, {
      alpha: 0,
      duration: 0.6,
    });

    this.#logo = new DrawableSprite({
      texture: useAsset('texture:logo.with-text'),
      scale: 0.5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      y: 250,
    });

    this.#logo.fadeIn({ duration: 500 });
    this.#logo.moveTo({ y: 100, duration: 1000, easing: 'expo.out' });

    this.addInternal(this.#logo);
  }

  #logo: DrawableSprite;

  #graphics: Graphics;

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    this.#graphics.position.copyFrom(this.drawSize.scale(0.5));
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
