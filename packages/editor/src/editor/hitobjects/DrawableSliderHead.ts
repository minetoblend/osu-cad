import { Anchor } from 'osucad-framework';
import { DrawableHitCircle } from './DrawableHitCircle';

export class DrawableSliderHead extends DrawableHitCircle {
  constructor() {
    super();
    this.origin = Anchor.Center;
  }

  protected override updatePosition() {
  }
}
