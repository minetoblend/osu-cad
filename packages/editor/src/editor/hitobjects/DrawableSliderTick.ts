import type { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import type { DrawableSlider } from './DrawableSlider';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Anchor, dependencyLoader, EasingFunction } from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSliderTick extends DrawableOsuHitObject<SliderTick> {
  #scaleContainer!: SkinnableDrawable;

  @dependencyLoader()
  load() {
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

  protected onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.position = this.hitObject!.position.sub(this.drawableSlider.hitObject!.position);
  }

  protected updateInitialTransforms() {
    this.fadeOut().fadeIn(150);
    this.scaleTo(0.5).scaleTo(1, 150 * 4, EasingFunction.Out);
  }

  protected updateStartTimeTransforms() {
    super.updateStartTimeTransforms();
    this.fadeOut(150, EasingFunction.OutQuint);
    this.scaleTo(1.5, 150, EasingFunction.Out);
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
    this.drawableSlider.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }

  protected override playSamples() {
  }
}
