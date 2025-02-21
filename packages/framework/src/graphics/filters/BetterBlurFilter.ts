import type { BlurFilterOptions } from 'pixi.js';
import { BlurFilter } from 'pixi.js';
import { BetterBlurFilterPass } from './BetterBlurFilterPass';

export class BetterBlurFilter extends BlurFilter {
  constructor(options: BlurFilterOptions = {}) {
    super({
      antialias: 'inherit',
      resolution: devicePixelRatio,
      ...options,
    });

    this.blurXFilter = new BetterBlurFilterPass({ horizontal: true, ...options });
    this.blurYFilter = new BetterBlurFilterPass({ horizontal: false, ...options });
  }
}
