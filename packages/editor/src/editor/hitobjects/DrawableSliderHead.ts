import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { DrawableHitCircle } from './DrawableHitCircle';

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
