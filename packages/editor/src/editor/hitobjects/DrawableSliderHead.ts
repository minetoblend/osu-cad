import type { Vec2 } from '../../../../framework/src';
import type { JudgementResult } from '../../beatmap/hitObjects/JudgementResult';
import type { HitSound } from '../../beatmap/hitSounds/HitSound';
import type { DrawableSlider } from './DrawableSlider';
import { HitResult } from '../../beatmap/hitObjects/HitResult';
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

  protected getHitSound(): HitSound {
    return this.drawableSlider.hitObject!.hitSounds[0];
  }

  get drawableSlider() {
    return this.parentHitObject as DrawableSlider;
  }

  protected applyResult(apply: (result: JudgementResult, hitObject: this) => void, position?: Vec2) {
    super.applyResult((result, hitObject) => {
      apply(result, hitObject);
      if (result.isHit)
        result.type = HitResult.Great;
    }, position);
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
    super.checkForResult(userTriggered, timeOffset);
    this.drawableSlider.sliderInputManager.postProcessHeadJudgement(this);
  }
}
