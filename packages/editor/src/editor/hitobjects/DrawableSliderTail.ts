import type { Slider } from '../../beatmap/hitObjects/Slider';
import type { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import type { HitSound } from '../../beatmap/hitSounds/HitSound.ts';
import type { DrawableSlider } from './DrawableSlider.ts';
import { Anchor, Axes, BindableBoolean, BindableNumber, Container, dependencyLoader, resolved } from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { ArmedState } from './ArmedState.ts';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSliderTail extends DrawableOsuHitObject<SliderTailCircle> {
  #scaleContainer!: Container;

  circlePiece!: SkinnableDrawable;

  scaleBindable = new BindableNumber(0);

  hitAnimations = new BindableBoolean();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimations);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        origin: Anchor.Center,
        anchor: Anchor.Center,
        children: [
          this.circlePiece = new SkinnableDrawable(OsuSkinComponentLookup.SliderTailHitCircle).with({
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
    return (this.drawableSlider.hitObject ?? null) as Slider | null;
  }

  updateInitialTransforms() {
    this.circlePiece
      .fadeOut()
      .delay((this.slider!.timePreempt ?? 0) / 3)
      .fadeIn(this.slider!.timeFadeIn);
  }

  protected updateHitStateTransforms(state: ArmedState) {
    this.delay(800).fadeOut();

    switch (state) {
      case ArmedState.Hit:
        this.circlePiece.scaleTo(1.5, 240).fadeIn(240);
        break;
      case ArmedState.Miss:
        this.fadeOut(100);
        break;
      case ArmedState.Idle:
        this.delay(800).fadeOut();
        break;
    }
  }

  onApplied() {
    super.onApplied();

    this.updatePosition();

    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.addListener(this.updatePosition, this);

    this.hitAnimations.valueChanged.addListener(this.refreshTransforms, this);
  }

  onFreed() {
    super.onFreed();

    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.removeListener(this.updatePosition, this);

    this.hitAnimations.valueChanged.removeListener(this.refreshTransforms, this);
  }

  updatePosition() {
    if (this.slider)
      this.position = this.slider!.curvePositionAt(this.hitObject!.repeatIndex % 2 === 0 ? 1 : 0);
  }

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
    this.drawableSlider.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }

  protected override playSamples() {
    if (this.time.current < this.hitObject!.endTime) {
      this.scheduler.addDelayed(() => super.playSamples(), this.hitObject!.endTime - this.time.current);
    }
    else {
      super.playSamples();
    }
  }

  protected override getHitSound(): HitSound {
    const hitSounds = this.slider!.hitSounds;

    return hitSounds[hitSounds.length - 1];
  }
}
