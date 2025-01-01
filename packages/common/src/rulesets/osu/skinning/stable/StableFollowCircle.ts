import type { Slider } from '../../hitObjects/Slider';
import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  EasingFunction,
  type ReadonlyDependencyContainer,
  resolved,
} from 'osucad-framework';
import { DrawableHitObject } from '../../../../hitObjects/drawables/DrawableHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { SliderRepeat } from '../../hitObjects/SliderRepeat';
import { SliderTick } from '../../hitObjects/SliderTick';

export class StableFollowCircle extends CompositeDrawable {
  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(DrawableHitObject)
  drawableHitObject!: DrawableHitObject;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      new DrawableSprite({
        texture: this.skin.getTexture('sliderfollowcircle'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.5,
      }),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.#applyCustomState, this);
    this.#applyCustomState(this.drawableHitObject);
  }

  #applyCustomState(parentObject: DrawableHitObject) {
    const hitObject = parentObject!.hitObject as Slider;

    const remainingTime = Math.max(hitObject.endTime - hitObject.startTime, 0);

    this.applyTransformsAt(-Number.MAX_VALUE);
    this.clearTransformsAfter(-Number.MAX_VALUE);

    if (hitObject.path.controlPoints.length === 0 || hitObject.expectedDistance <= 0) {
      this.fadeOut();
      return;
    }

    this.absoluteSequence(hitObject.startTime, () => {
      this
        .scaleTo(1)
        .scaleTo(2, Math.min(180, remainingTime), EasingFunction.Out);

      this.fadeInFromZero(Math.min(60, remainingTime));
    });

    for (const nested of hitObject.nestedHitObjects) {
      if (nested instanceof SliderTick || nested instanceof SliderRepeat) {
        this.absoluteSequence(nested.startTime, () => this.scaleTo(2.2).scaleTo(2, 200));
      }
    }

    this.absoluteSequence(hitObject.endTime, () => {
      this.scaleTo(1.6, 200, EasingFunction.Out).fadeOut(200, EasingFunction.In);
    });
  }

  override update() {
    super.update();
  }

  override dispose(isDisposing: boolean = true) {
    this.drawableHitObject.applyCustomUpdateState.removeListener(this.#applyCustomState, this);

    super.dispose(isDisposing);
  }
}
