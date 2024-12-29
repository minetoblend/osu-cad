import type { Vec2 } from 'osucad-framework';
import type { JudgementResult } from '../../../../hitObjects/JudgementResult';
import type { HitSound } from '../../../../hitsounds/HitSound';
import type { DrawableSlider } from './DrawableSlider';
import { HitResult } from '../../../../hitObjects/HitResult';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { DrawableHitCircle } from './DrawableHitCircle';

export class DrawableSliderHead extends DrawableHitCircle {
  constructor() {
    super();
  }

  override get circlePieceComponent() {
    return OsuSkinComponentLookup.SliderHeadHitCircle;
  }

  override updatePosition() {}

  protected override getHitSound(): HitSound {
    return this.drawableSlider.hitObject!.hitSounds[0];
  }

  get drawableSlider() {
    return this.parentHitObject as DrawableSlider;
  }

  protected override applyResult(apply: (result: JudgementResult, hitObject: this) => void, position?: Vec2) {
    super.applyResult((result, hitObject) => {
      apply(result, hitObject);
      if (result.isHit)
        result.type = HitResult.Great;
    }, position);
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    super.checkForResult(userTriggered, timeOffset);
    this.drawableSlider.sliderInputManager.postProcessHeadJudgement(this);
  }
}
