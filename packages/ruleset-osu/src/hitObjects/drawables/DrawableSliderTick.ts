import type { HitObjectLifetimeEntry } from '@osucad/common';
import type { SliderTick } from '../SliderTick';
import type { DrawableSlider } from './DrawableSlider';
import { SkinnableDrawable } from '@osucad/common';
import { Anchor, EasingFunction, type ReadonlyDependencyContainer } from 'osucad-framework';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { OsuHitObject } from '../OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSliderTick extends DrawableOsuHitObject<SliderTick> {
  #scaleContainer!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.size = OsuHitObject.object_dimensions;
    this.origin = Anchor.Center;

    this.addInternal(
      this.#scaleContainer = new SkinnableDrawable(OsuSkinComponentLookup.SliderScorePoint).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.scaleBindable.addOnChangeListener(scale => this.#scaleContainer.scale = scale.value);
  }

  get drawableSlider() {
    return this.parentHitObject as DrawableSlider;
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.position = this.hitObject!.position.sub(this.drawableSlider.hitObject!.position);
  }

  protected override updateInitialTransforms() {
    this.fadeOut().fadeIn(150);
    this.scaleTo(0.5).scaleTo(1, 150 * 4, EasingFunction.Out);
  }

  protected override updateStartTimeTransforms() {
    super.updateStartTimeTransforms();
    this.fadeOut(150, EasingFunction.OutQuint);
    this.scaleTo(1.5, 150, EasingFunction.Out);
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    this.drawableSlider.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }

  protected override playSamples() {
  }
}
