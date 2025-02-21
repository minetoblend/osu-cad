import type { HitSound } from '@osucad/core';
import type { Slider } from '../Slider';
import type { SliderTailCircle } from '../SliderTailCircle';
import type { DrawableSlider } from './DrawableSlider';
import { ArmedState, OsucadConfigManager, OsucadSettings, SkinnableDrawable } from '@osucad/core';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Container,
  type ReadonlyDependencyContainer,
  resolved,
} from '@osucad/framework';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { OsuHitObject } from '../OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSliderTail extends DrawableOsuHitObject<SliderTailCircle> {
  #scaleContainer!: Container;

  circlePiece!: SkinnableDrawable;

  hitAnimations = new BindableBoolean();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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

  protected override updateInitialTransforms() {
    this.circlePiece.fadeOut()
      .delay((this.slider!.timePreempt ?? 0) / 3)
      .fadeIn(this.slider!.timeFadeIn);
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    // this.delay(800).fadeOut();

    switch (state) {
      case ArmedState.Hit:
        if (this.hitAnimations.value)
          this.circlePiece.scaleTo(1.5, 240).fadeIn(240);
        else
          this.fadeOut(700);
        break;
      case ArmedState.Miss:
        this.fadeOut(100);
        break;
      case ArmedState.Idle:
        this.delay(800).fadeOut();
        break;
    }
  }

  protected override onApplied() {
    super.onApplied();

    this.updatePosition();

    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.addListener(this.updatePosition, this);

    this.hitAnimations.valueChanged.addListener(this.refreshTransforms, this);
  }

  protected override onFreed() {
    super.onFreed();

    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.removeListener(this.updatePosition, this);

    this.hitAnimations.valueChanged.removeListener(this.refreshTransforms, this);
  }

  updatePosition() {
    if (this.slider)
      this.position = this.slider!.curvePositionAt(this.hitObject!.repeatIndex % 2 === 0 ? 1 : 0);
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
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
