import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableSlider } from '../hitObjects/drawables/DrawableSlider';

import { ArmedState, DrawableHitObject } from '@osucad/core';
import { Axes, CompositeDrawable, resolved } from '@osucad/framework';
import { DrawableSliderRepeat } from '../hitObjects/drawables/DrawableSliderRepeat';
import { DrawableSliderTail } from '../hitObjects/drawables/DrawableSliderTail';
import { DrawableSliderTick } from '../hitObjects/drawables/DrawableSliderTick';

export abstract class FollowCircle extends CompositeDrawable {
  @resolved(DrawableHitObject, true)
  parentObject?: DrawableHitObject;

  protected constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    (this.parentObject as DrawableSlider)?.tracking.bindValueChanged((tracking) => {
      if (this.parentObject!.judged && !this.parentObject?.alwaysHit)
        return;

      this.absoluteSequence({
        time: Math.max(this.time.current, this.parentObject!.hitObject?.startTime ?? 0),
        recursive: true,
      }, () => {
        if (tracking.value)
          this.onSliderPress();
        else
          this.onSliderRelease();
      });
    }, true);
  }

  protected override loadComplete() {
    super.loadComplete();

    if (this.parentObject) {
      this.parentObject.hitObjectApplied.addListener(this.#onHitObjectApplied, this);
      this.#onHitObjectApplied(this.parentObject);

      this.parentObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
      this.#updateStateTransforms(this.parentObject);
    }
  }

  #onHitObjectApplied(drawableObject: DrawableHitObject) {
    this.scaleTo(1).fadeOut();
  }

  #updateStateTransforms(drawableObject: DrawableHitObject, state: ArmedState = this.parentObject!.state.value) {
    switch (state) {
      case ArmedState.Hit:
        switch (drawableObject.constructor) {
          case DrawableSliderTail:
            this.absoluteSequence({ time: drawableObject.hitStateUpdateTime, recursive: true }, () =>
              this.onSliderEnd());
            break;

          case DrawableSliderTick:
          case DrawableSliderRepeat:
            this.absoluteSequence({ time: drawableObject.hitStateUpdateTime, recursive: true }, () =>
              this.onSliderTick());
            break;
        }
        break;

      case ArmedState.Miss:
        switch (drawableObject.constructor) {
          case DrawableSliderTail:
          case DrawableSliderTick:
          case DrawableSliderRepeat:
            this.absoluteSequence({ time: drawableObject.hitStateUpdateTime, recursive: true }, () =>
              this.onSliderBreak());
            break;
        }
    }
  }

  protected abstract onSliderPress(): void;

  protected abstract onSliderRelease(): void;

  protected abstract onSliderEnd(): void;

  protected abstract onSliderTick(): void;

  protected abstract onSliderBreak(): void;
}
