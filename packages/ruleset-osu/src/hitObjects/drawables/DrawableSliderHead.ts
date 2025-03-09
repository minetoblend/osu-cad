import type { ArmedState, HitSound } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { Slider } from '../Slider';
import type { DrawableSlider } from './DrawableSlider';
import { OsucadConfigManager, OsucadSettings } from '@osucad/core';
import { BindableBoolean } from '@osucad/framework';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { DrawableHitCircle } from './DrawableHitCircle';

export class DrawableSliderHead extends DrawableHitCircle {
  constructor() {
    super();
  }

  snakeOutSliders = new BindableBoolean();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);
    config.bindWith(OsucadSettings.SnakingOutSliders, this.snakeOutSliders);
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

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    super.checkForResult(userTriggered, timeOffset);
    this.drawableSlider.sliderInputManager.postProcessHeadJudgement(this);
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(state);

    if (this.snakeOutSliders.value)
      this.absoluteSequence(this.hitObject!.startTime, () => this.fadeOutFromOne());

    const slider = this.parentHitObject!.hitObject as Slider;
    if (slider.path.expectedDistance > 0) {
      const angle = slider.path.calculatedRange.path[1].angle();
      this.circlePiece.rotation = angle;
      this.approachCircle.rotation = angle;
    }
  }
}
