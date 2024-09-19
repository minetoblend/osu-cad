import type { DrawableSlider } from './DrawableSlider';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableSliderBall extends CompositeDrawable {
  @resolved(DrawableHitObject)
  drawableSlider!: DrawableSlider;

  @dependencyLoader()
  load() {
    this.size = OsuHitObject.object_dimensions;
    this.origin = Anchor.Center;

    this.addAllInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.SliderFollowCircle).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.ball = new SkinnableDrawable(OsuSkinComponentLookup.SliderBall).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  protected ball!: SkinnableDrawable;

  override clearTransformsAfter(time: number, propagateChildren?: boolean, targetMember?: string) {
    super.clearTransformsAfter(time, false, targetMember);
  }

  override applyTransformsAt(time: number) {
    super.applyTransformsAt(time, false);
  }

  updateProgress(completionProgress: number) {
    const slider = this.drawableSlider.hitObject!;

    const position = this.position = slider.curvePositionAt(completionProgress);

    const diff = position.sub(slider.curvePositionAt(Math.min(1, completionProgress + 0.1 / slider.path.expectedDistance)));

    if (diff.length() < 0.05)
      return;

    this.ball.rotation = -Math.atan2(diff.x, diff.y) - Math.PI * 0.5;
  }
}
