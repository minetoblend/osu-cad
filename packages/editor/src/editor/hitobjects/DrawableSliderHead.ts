import { DrawableHitCircle } from './DrawableHitCircle.ts';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup.ts';

export class DrawableSliderHead extends DrawableHitCircle {
  constructor() {
    super();
  }

  override get circlePieceComponent() {
    return OsuSkinComponentLookup.SliderHeadHitCircle;
  }

  override updatePosition() {}

  onApplied() {
    super.onApplied();

    // debugger
  }
}
