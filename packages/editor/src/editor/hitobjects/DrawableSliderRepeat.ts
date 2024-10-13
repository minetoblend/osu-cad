import type { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import type { HitSound } from '../../beatmap/hitSounds/HitSound';
import type { ArmedState } from './ArmedState';
import type { DrawableSlider } from './DrawableSlider';
import type { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { almostEquals, Anchor, Axes, Container, dependencyLoader, Vec2 } from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

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
  }

  updatePosition(
    start: Vec2,
    end: Vec2,
  ) {
    const isAtEnd = this.hitObject!.repeatIndex % 2 === 0;

    this.position = isAtEnd ? end : start;

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

    this.#animDuration = Math.min(700, this.hitObject!.spanDuration * 2);

    this.fadeOut()
      .delay(delayFadeIn ? (this.slider?.timePreempt ?? 0) / 3 : 0)
      .fadeIn(this.hitObject!.repeatIndex === 0 ? this.hitObject!.timeFadeIn : this.#animDuration);
  }

  protected updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(state);

    this.fadeOut(this.#animDuration);
    this.arrow.fadeOut(300);
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
    this.drawableSlider.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }

  protected getHitSound(): HitSound {
    return this.slider!.hitSounds[this.hitObject!.repeatIndex + 1];
  }
}
