import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { Anchor, Axes, BindableBoolean, dependencyLoader, resolved } from 'osucad-framework';
import { HitCircle } from '../../beatmap/hitObjects/HitCircle';
import { Slider } from '../../beatmap/hitObjects/Slider';
import { SliderHeadCircle } from '../../beatmap/hitObjects/SliderHeadCircle';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { Spinner } from '../../beatmap/hitObjects/Spinner';
import { OsucadConfigManager } from '../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../config/OsucadSettings.ts';
import { DrawableHitCircle } from './DrawableHitCircle';
import { DrawableSlider } from './DrawableSlider';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';
import { DrawableSpinner } from './DrawableSpinner';
import { FollowPointRenderer } from './FollowPointRenderer';
import { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Playfield } from './Playfield';

export class OsuPlayfield extends Playfield {
  protected followPoints!: FollowPointRenderer;

  followPointsEnabled = new BindableBoolean(true);

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addInternal(
      this.followPoints = new FollowPointRenderer().with({
        relativeSizeAxes: Axes.Both,
      }),
    );

    this.registerPool(HitCircle, DrawableHitCircle, 10, 100);
    this.registerPool(Slider, DrawableSlider, 5, 100);
    this.registerPool(SliderHeadCircle, DrawableSliderHead, 5, 100);
    this.registerPool(SliderTailCircle, DrawableSliderTail, 5, 100);
    this.registerPool(SliderTick, DrawableSliderTick, 10, 100);
    this.registerPool(SliderRepeat, DrawableSliderRepeat, 10, 100);
    this.registerPool(Spinner, DrawableSpinner, 1, 5);

    this.config.bindWith(OsucadSettings.FollowPoints, this.followPointsEnabled);

    this.followPointsEnabled.addOnChangeListener(e => this.followPoints.alpha = e.value ? 1 : 0, { immediate: true });
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
