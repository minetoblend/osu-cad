import type { Drawable } from '../drawables/index';
import { BlurFilter, type Filter } from 'pixi.js';
import { Container, type ContainerOptions } from './Container';

export interface BlurContainerOptions<T extends Drawable = Drawable> extends ContainerOptions<T> {
  blurStrength?: number;
  blurQuality?: number;
}

export class BlurContainer<T extends Drawable = Drawable> extends Container<T> {
  constructor(options: BlurContainerOptions<T> = {}) {
    const { blurStrength = 0, blurQuality = 3, ...rest } = options;
    super(rest);

    this.blurStrength = blurStrength;
    this.blurQuality = blurQuality;
    this.filters = [this.#filter];
  }

  #filter = new BlurFilter({});

  get blurStrength() {
    return this.#filter.blur;
  }

  set blurStrength(value: number) {
    if (value < 0) {
      throw new Error('Blur strength cannot be negative');
    }

    this.#filter.blur = value;

    if (value === 0) {
      this.drawNode.filters = [];
    }
    else {
      if ((this.drawNode.filters as Filter[]).length === 0) {
        this.drawNode.filters = [this.#filter];
      }

      if (value > 5) {
        this.#filter.antialias = 'off';
        this.#filter.resolution = 0.5;
      }
      else {
        this.#filter.antialias = 'on';
        this.#filter.resolution = 1;
      }
    }
  }

  get blurQuality() {
    return this.#filter.quality;
  }

  set blurQuality(value: number) {
    if (value < 0) {
      throw new Error('Blur quality cannot be negative');
    }

    this.#filter.quality = Math.ceil(value);
  }
}
