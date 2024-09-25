import type { Slider } from '../../beatmap/hitObjects/Slider';
import type { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import { Anchor, Axes, BindableBoolean, BindableNumber, Container, dependencyLoader, resolved } from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
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

  get slider() {
    return (this.parentHitObject?.hitObject ?? null) as Slider | null;
  }

  updateInitialTransforms() {
    this.circlePiece
      .fadeOut()
      .delay((this.slider!.timePreempt ?? 0) / 3)
      .fadeIn(this.slider!.timeFadeIn);
  }

  protected updateEndTimeTransforms() {
    this.delay(800).fadeOut();

    if (this.hitAnimations.value) {
      this.circlePiece.scaleTo(1.5, 240).fadeOut(240);
    }
  }

  onApplied() {
    this.updatePosition();

    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.addListener(this.updatePosition, this);

    this.hitAnimations.valueChanged.addListener(this.updateState, this);
  }

  onFreed() {
    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.removeListener(this.updatePosition);

    this.hitAnimations.valueChanged.removeListener(this.updateState);
  }

  updatePosition() {
    if (this.slider)
      this.position = this.slider!.curvePositionAt(this.hitObject!.repeatIndex % 2 === 0 ? 1 : 0);
  }
}
