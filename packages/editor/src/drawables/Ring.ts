import type { DrawableOptions } from 'osucad-framework';
import type { Graphics } from 'pixi.js';
import { GraphicsDrawable } from './GraphicsDrawable';

export interface RingOptions extends DrawableOptions {
  strokeWidth?: number;
  strokeAlignment?: number;
}

export class Ring extends GraphicsDrawable {
  constructor(options: RingOptions) {
    super();

    this.apply(options);
  }

  get strokeWidth() {
    return this.#strokeWidth;
  }

  set strokeWidth(value: number) {
    if (this.#strokeWidth === value)
      return;

    this.#strokeWidth = value;

    this.invalidateGraphics();
  }

  #strokeWidth = 1;

  get strokeAlignment() {
    return this.#strokeAlignment;
  }

  set strokeAlignment(value: number) {
    if (this.#strokeAlignment === value)
      return;

    this.#strokeAlignment = value;

    this.invalidateGraphics();
  }

  #strokeAlignment = 0.5;

  updateGraphics(g: Graphics) {
    const drawSize = this.drawSize;

    g.clear()
      .ellipse(
        drawSize.x * 0.5,
        drawSize.y * 0.5,
        this.drawSize.x * 0.5,
        this.drawSize.y * 0.5,
      )
      .stroke({
        color: 0xFFFFFF,
        width: this.#strokeWidth,
        alignment: this.#strokeAlignment,
      });
  }
}
