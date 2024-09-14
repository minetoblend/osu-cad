import { Anchor, Axes, BindableNumber, Container, dependencyLoader, resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject.ts';
import { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle.ts';
import { Slider } from '../../beatmap/hitObjects/Slider.ts';

export class DrawableSliderTail extends DrawableOsuHitObject<SliderTailCircle> {
  constructor() {
    super();
  }

  #scaleContainer!: Container;

  circlePiece!: SkinnableDrawable;

  scaleBindable = new BindableNumber(0);

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
    return (this.parentHitObject?.hitObject ?? null) as Slider | null;
  }

  updateInitialTransforms() {
    this.circlePiece
      .fadeOut()
      .delay((this.slider!.timePreempt ?? 0) / 3)
      .fadeIn(this.slider!.timeFadeIn);
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  protected updateEndTimeTransforms() {
    this.delay(800).fadeOut();
  }

  onApplied() {
    this.updatePosition();

    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.addListener(this.updatePosition, this);
  }

  onFreed() {
    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.slider!.path.invalidated.removeListener(this.updatePosition);
  }

  updatePosition() {
    if (this.slider)
      this.position = this.slider!.curvePositionAt(this.hitObject!.repeatIndex % 2 === 0 ? 1 : 0);
  }
}
