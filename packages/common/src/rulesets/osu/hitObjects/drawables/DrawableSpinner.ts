import type { ReadonlyDependencyContainer, TransformSequenceProxy } from 'osucad-framework';
import type { ArmedState } from '../../../../hitObjects/drawables/ArmedState';
import type { Spinner } from '../Spinner';
import { Anchor, Axes, EasingFunction } from 'osucad-framework';
import { AspectContainer } from '../../../../drawables/AspectContainer';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class DrawableSpinner extends DrawableOsuHitObject<Spinner> {
  body!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.relativeSizeAxes = Axes.Both;

    this.alpha = 0;

    this.addAllInternal(
      new AspectContainer({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Y,
        children: [
          this.body = new SkinnableDrawable(OsuSkinComponentLookup.SpinnerBody),
        ],
      }),
    );

    this.positionBindable.valueChanged.addListener(position => this.position = position.value);
  }

  spin = 0;

  protected override updateInitialTransforms() {
    super.updateInitialTransforms();

    this.fadeTo(0)
      .delay(this.hitObject!.timePreempt - this.hitObject!.timeFadeIn)
      .fadeInFromZero(this.hitObject!.timeFadeIn);
  }

  protected override updateStartTimeTransforms() {
    super.updateStartTimeTransforms();

    const totalTime = this.hitObject!.duration + 240;

    const spinUpTime = Math.min(400, totalTime / 3);
    const spinDownTime = Math.min(600, totalTime * 2 / 3);

    const spinTime = Math.max(totalTime - spinUpTime - spinDownTime, 0);

    const spinSpeed = spinUpTime * 0.000065;

    let curSpin: number;

    this.spinTo(curSpin = spinSpeed * spinUpTime * 0.5, spinUpTime, EasingFunction.InQuad)
      .then()
      .spinTo(curSpin = curSpin + spinSpeed * spinTime, spinTime)
      .then()
      .spinTo(curSpin + spinSpeed * spinDownTime * 0.5, spinDownTime, EasingFunction.OutQuad);
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(state);

    this.fadeOut(240)
      .expire();
  }

  protected spinTo(spin: number, duration: number, easing: EasingFunction = EasingFunction.Default): TransformSequenceProxy<this> {
    return this.transformTo('spin', spin, duration, easing);
  }
}
