import { Anchor, EasingFunction, dependencyLoader } from 'osucad-framework';
import type { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import type { DrawableSlider } from './DrawableSlider';

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
}
