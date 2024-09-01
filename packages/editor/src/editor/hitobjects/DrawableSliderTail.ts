import { Anchor, Axes, Container, dependencyLoader, resolved } from 'osucad-framework';
import type { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSliderTail extends DrawableOsuHitObject<SliderTailCircle> {
  constructor() {
    super();
  }

  #scaleContainer!: Container;

  circlePiece!: SkinnableDrawable;

  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        origin: Anchor.Center,
        anchor: Anchor.Center,
        children: [
          this.circlePiece = new SkinnableDrawable(OsuSkinComponentLookup.SliderTailHitCircle),
        ],
      }),
    );

    this.scaleBindable.addOnChangeListener(scale => this.#scaleContainer.scale = scale.value);
  }

  get slider() {
    return this.parentHitObject?.hitObject as Slider | undefined;
  }

  updateInitialTransforms() {
    this.circlePiece
      .fadeOut()
      .delay((this.slider?.timePreempt ?? 0) / 3)
      .fadeIn(this.hitObject!.timeFadeIn);
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  protected updateEndTimeTransforms() {
    super.updateEndTimeTransforms();

    this.delay(800).fadeOut();
  }

  onApplied() {
    super.onApplied();

    this.updatePosition();

    (this.parentHitObject!.hitObject as Slider).path.invalidated.addListener(this.updatePosition, this);
  }

  onFreed() {
    super.onFreed();

    (this.parentHitObject!.hitObject as Slider).path.invalidated.removeListener(this.updatePosition);
  }

  updatePosition() {
    if (this.slider)
      this.position = this.slider.curvePositionAt(this.hitObject!.repeatIndex % 2 === 0 ? 1 : 0);
  }
}
