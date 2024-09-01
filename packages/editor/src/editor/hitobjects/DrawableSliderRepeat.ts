import { Anchor, Axes, Container, Vec2, almostEquals, dependencyLoader } from 'osucad-framework';
import type { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import type { DrawableSlider } from './DrawableSlider';

export class DrawableSliderRepeat extends DrawableOsuHitObject<SliderRepeat> {
  circlePiece!: SkinnableDrawable;

  arrow!: SkinnableDrawable;

  #scaleContainer!: Container;

  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addAllInternal(
      this.#scaleContainer = new Container({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Both,
        children: [
          this.circlePiece = new SkinnableDrawable(OsuSkinComponentLookup.SliderTailHitCircle).with({
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
          this.arrow = new SkinnableDrawable(OsuSkinComponentLookup.ReverseArrow).with({
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
        ],
      }),
    );

    this.scaleBindable.addOnChangeListener(scale => this.#scaleContainer.scale = scale.value);
  }

  get drawableSlider() {
    return this.parentHitObject as DrawableSlider;
  }

  get slider() {
    return this.drawableSlider.hitObject;
  }

  protected onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.position = this.hitObject!.position.sub(this.drawableSlider.hitObject!.position);

    const isAtEnd = this.hitObject!.repeatIndex % 2 === 0;

    const curve = this.slider!.path.calculatedRange.path;

    const searchStart = isAtEnd ? curve.length - 1 : 0;
    const direction = isAtEnd ? -1 : 1;

    let rotationVector = Vec2.zero();

    for (let i = searchStart; i >= 0 && i < curve.length; i += direction) {
      if (almostEquals(curve[i].x, this.position.x) && almostEquals(curve[i].y, this.position.y))
        continue;

      rotationVector = curve[i];
      break;
    }

    this.arrow.rotation = Math.atan2(rotationVector.y - this.y, rotationVector.x - this.x);
  }

  #animDuration = 300;

  protected updateInitialTransforms() {
    super.updateInitialTransforms();

    const delayFadeIn = this.hitObject!.repeatIndex === 0;

    this.#animDuration = Math.min(700, this.hitObject!.spanDuration);

    this.fadeOut()
      .delay(delayFadeIn ? (this.slider?.timePreempt ?? 0) / 3 : 0)
      .fadeIn(this.hitObject!.repeatIndex === 0 ? this.hitObject!.timeFadeIn : this.#animDuration);
  }

  protected updateEndTimeTransforms() {
    super.updateEndTimeTransforms();

    this.fadeOut(this.#animDuration);
  }
}
