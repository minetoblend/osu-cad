import { Anchor, Axes, dependencyLoader } from 'osucad-framework';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import { HitCircle } from '../../beatmap/hitObjects/HitCircle';
import { Slider } from '../../beatmap/hitObjects/Slider';
import { SliderHeadCircle } from '../../beatmap/hitObjects/SliderHeadCircle';
import { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { Spinner } from '../../beatmap/hitObjects/Spinner';
import { Playfield } from './Playfield';
import { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { DrawableHitCircle } from './DrawableHitCircle';
import { DrawableSlider } from './DrawableSlider';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { FollowPointRenderer } from './FollowPointRenderer';
import { DrawableSpinner } from './DrawableSpinner';

export class OsuPlayfield extends Playfield {
  protected followPoints!: FollowPointRenderer;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(
      this.followPoints = new FollowPointRenderer().with({
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.registerPool(HitCircle, DrawableHitCircle, 20, 100);
    this.registerPool(Slider, DrawableSlider, 20, 100);
    this.registerPool(SliderHeadCircle, DrawableSliderHead, 20, 100);
    this.registerPool(SliderTailCircle, DrawableSliderTail, 20, 100);
    this.registerPool(SliderTick, DrawableSliderTick, 20, 100);
    this.registerPool(SliderRepeat, DrawableSliderRepeat, 20, 100);
    this.registerPool(Spinner, DrawableSpinner, 1, 5);
  }

  protected createLifeTimeEntry(hitObject: HitObject): HitObjectLifetimeEntry {
    return new OsuHitObjectLifetimeEntry(hitObject as OsuHitObject);
  }

  protected onHitObjectAdded(hitObject: HitObject) {
    super.onHitObjectAdded(hitObject);
    this.followPoints.addFollowPoints(hitObject as OsuHitObject);
  }

  protected onHitObjectRemoved(hitObject: HitObject) {
    super.onHitObjectRemoved(hitObject);
    this.followPoints.removeFollowPoints(hitObject as OsuHitObject);
  }
}

class OsuHitObjectLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);

    this.lifetimeEnd = hitObject.endTime + 700;
  }

  get initialLifetimeOffset() {
    return this.hitObject.timePreempt;
  }
}
