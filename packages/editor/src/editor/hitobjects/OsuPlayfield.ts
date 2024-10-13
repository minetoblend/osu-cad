import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { JudgementResult } from '../../beatmap/hitObjects/JudgementResult.ts';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { DrawableHitObject } from './DrawableHitObject.ts';
import type { DrawableOsuHitObject } from './DrawableOsuHitObject.ts';
import type { IHitPolicy } from './IHitPolicy.ts';
import { Anchor, Axes, BindableBoolean, Container, dependencyLoader, resolved } from 'osucad-framework';
import { HitCircle } from '../../beatmap/hitObjects/HitCircle';
import { Slider } from '../../beatmap/hitObjects/Slider';
import { SliderHeadCircle } from '../../beatmap/hitObjects/SliderHeadCircle';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { SliderTailCircle } from '../../beatmap/hitObjects/SliderTailCircle';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { Spinner } from '../../beatmap/hitObjects/Spinner';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { DrawableHitCircle } from './DrawableHitCircle';
import { DrawableJudgement } from './DrawableJudgement.ts';
import { DrawableSlider } from './DrawableSlider';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';
import { DrawableSpinner } from './DrawableSpinner';
import { FollowPointRenderer } from './FollowPointRenderer';
import { HitObjectLifetimeEntry } from './HitObjectLifetimeEntry';
import { Playfield } from './Playfield';
import { StartTimeOrderedHitPolicy } from './StartTimeOrderedHitPolicy.ts';

export class OsuPlayfield extends Playfield {
  protected followPoints!: FollowPointRenderer;

  followPointsEnabled = new BindableBoolean(true);

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  #judgementContainer = new Container({ relativeSizeAxes: Axes.Both });

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addAllInternal(
      this.followPoints = new FollowPointRenderer().with({
        relativeSizeAxes: Axes.Both,
      }),
      this.#judgementContainer.with({
        depth: -1,
      }),
    );

    this.hitPolicy ??= new StartTimeOrderedHitPolicy();

    this.registerPool(HitCircle, DrawableHitCircle, 10, 100);
    this.registerPool(Slider, DrawableSlider, 5, 100);
    this.registerPool(SliderHeadCircle, DrawableSliderHead, 5, 100);
    this.registerPool(SliderTailCircle, DrawableSliderTail, 5, 100);
    this.registerPool(SliderTick, DrawableSliderTick, 10, 100);
    this.registerPool(SliderRepeat, DrawableSliderRepeat, 10, 100);
    this.registerPool(Spinner, DrawableSpinner, 1, 5);

    this.config.bindWith(OsucadSettings.FollowPoints, this.followPointsEnabled);

    this.followPointsEnabled.addOnChangeListener(e => this.followPoints.alpha = e.value ? 1 : 0, { immediate: true });

    this.newResult.addListener(this.#onNewResult, this);
  }

  #onNewResult([hitObject, result]: [DrawableHitObject, JudgementResult]) {
    this.hitPolicy!.handleHit(hitObject);

    if (this.showJudgements) {
      if (hitObject.parentHitObject)
        return;

      this.#judgementContainer.add(new DrawableJudgement(result));
    }
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

  #hitPolicy: IHitPolicy | null = null;

  showJudgements = true;

  get hitPolicy(): IHitPolicy | null {
    return this.#hitPolicy;
  }

  set hitPolicy(value: IHitPolicy) {
    this.#hitPolicy = value;
    value.setHitObjectContainer(this.hitObjectContainer);
  }

  protected onNewDrawableHitObject(drawable: DrawableHitObject) {
    (drawable as DrawableOsuHitObject).checkHittable = this.hitPolicy?.checkHittable ?? null;
  }
}

class OsuHitObjectLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);

    this.lifetimeEnd = hitObject.endTime + 700;

    hitObject.defaultsApplied.addListener((e) => {
      if (this.lifetimeEnd < hitObject.endTime + 700)
        this.lifetimeEnd = hitObject.endTime + 700;
    });
  }

  get initialLifetimeOffset() {
    return this.hitObject.timePreempt;
  }
}
