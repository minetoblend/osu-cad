import type { ContainerOptions } from './Container.ts';
import { Graphics } from 'pixi.js';
import { Invalidation, LayoutMember } from '../drawables';
import { Container } from './Container.ts';

export interface MaskingContainerOptions extends ContainerOptions {
  cornerRadius?: number;
}

export class MaskingContainer extends Container {
  constructor(options: MaskingContainerOptions = {}) {
    super();

    this.addLayout(this.#maskBacking);

    this.drawNode.addChild(this.#mask);
    this.drawNode.mask = this.#mask;

    this.with(options);
  }

  #maskBacking = new LayoutMember(Invalidation.DrawSize);

  #cornerRadius = 0;

  #mask = new Graphics();

  get cornerRadius() {
    return this.#cornerRadius;
  }

  set cornerRadius(value: number) {
    if (value === this.#cornerRadius)
      return;

    this.#cornerRadius = value;
    this.#maskBacking.invalidate();
  }

  override update() {
    super.update();

    if (!this.#maskBacking.isValid) {
      this.#updateMask();

      this.#maskBacking.validate();
    }
  }

  #updateMask() {
    this.#mask.clear();

    const radius = this.#cornerRadius;

    if (radius <= 0) {
      this.#mask.rect(0, 0, this.drawSize.x, this.drawSize.y);
    }
    else {
      this.#mask.roundRect(0, 0, this.drawSize.x, this.drawSize.y, radius);
    }

    this.#mask.fill({
      color: 0xFFFFFF,
    });
  }
}
