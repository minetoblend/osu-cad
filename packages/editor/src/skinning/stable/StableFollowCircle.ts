import type { Slider } from '../../beatmap/hitObjects/Slider';
import {
  Anchor,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  resolved,
} from 'osucad-framework';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject';
import { ISkinSource } from '../ISkinSource';

export class StableFollowCircle extends CompositeDrawable {
  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(DrawableHitObject)
  drawableHitObject!: DrawableHitObject;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new DrawableSprite({
        texture: this.skin.getTexture('sliderfollowcircle'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.5,
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.#applyCustomState, this);
    this.#applyCustomState(this.drawableHitObject);
  }

  #applyCustomState(parentObject: DrawableHitObject) {
    const hitObject = parentObject!.hitObject as Slider;

    const remainingTime = Math.max(hitObject.endTime - hitObject.startTime, 0);

    this.applyTransformsAt(Number.MIN_VALUE);
    this.clearTransformsAfter(Number.MIN_VALUE);

    this.absoluteSequence(hitObject.startTime, () => {
      this
        .scaleTo(1)
        .scaleTo(2, Math.min(180, remainingTime), EasingFunction.Out)
        .fadeTo(0)
        .fadeTo(1, Math.min(60, remainingTime));
    });

    for (const nested of hitObject.nestedHitObjects) {
      if (nested instanceof SliderTick || nested instanceof SliderRepeat) {
        this.absoluteSequence(nested.startTime, () => {
          this.scaleTo(2.2).scaleTo(2, 200);
        });
      }
    }

    this.absoluteSequence(hitObject.endTime, () => {
      this.scaleTo(1.6, 200, EasingFunction.Out)
        .fadeOut(200, EasingFunction.In);
    });
  }
}
