import type { DrawableOptions } from '@osucad/framework';
import type { PIXIContainer } from '../../../framework/src/pixi';
import { Drawable, EasingFunction } from '@osucad/framework';
import { Graphics } from 'pixi.js';

export class LoadingSpinner extends Drawable {
  constructor(options: DrawableOptions = {}) {
    super();
    this.with({
      color: 0x52CCA3,
      ...options,
    });
  }

  createDrawNode(): PIXIContainer {
    return this.#graphics = new Graphics();
  }

  #graphics!: Graphics;

  override update() {
    super.update();

    this.#updateGraphics(this.#graphics);
  }

  animationSpeed = 2;

  #updateGraphics(g: Graphics) {
    function animate(time: number, offset = 0) {
      const t = (time / 1000 + offset) % 1;

      return (EasingFunction.InOutCubic(t) * 0.5 + t * 0.5) * Math.PI * 2 + Math.PI * 1.5;
    }

    const startAngle = animate(this.time.current * this.animationSpeed);
    let endAngle = animate(this.time.current * this.animationSpeed, 0.3);

    if (endAngle < startAngle) {
      endAngle += Math.PI * 2;
    }

    const drawSize = this.drawSize;
    const radius = Math.min(drawSize.x, drawSize.y) / 2;

    g.clear()
      .arc(drawSize.x / 2, this.drawSize.y / 2, radius, startAngle, endAngle)
      .stroke({
        color: 0xFFFFFF,
        width: radius * 0.25,
        cap: 'round',
      });
  }
}
