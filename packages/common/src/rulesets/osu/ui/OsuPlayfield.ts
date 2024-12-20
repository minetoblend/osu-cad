import type { DrawableHitObject } from '../../../hitObjects/drawables/DrawableHitObject';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { JudgementResult } from '../../../hitObjects/JudgementResult';
import type { IHitPolicy } from '../../ui/IHitPolicy';
import type { DrawableOsuHitObject } from '../hitObjects/drawables/DrawableOsuHitObject';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Anchor, Axes, BindableBoolean, Container, dependencyLoader, provide, resolved } from 'osucad-framework';
import { OsucadConfigManager } from '../../../config/OsucadConfigManager';
import { OsucadSettings } from '../../../config/OsucadSettings';
import { HitObjectLifetimeEntry } from '../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { Playfield } from '../../ui/Playfield';
import { DrawableHitCircle } from '../hitObjects/drawables/DrawableHitCircle';
import { DrawableSlider } from '../hitObjects/drawables/DrawableSlider';
import { DrawableSliderHead } from '../hitObjects/drawables/DrawableSliderHead';
import { DrawableSliderRepeat } from '../hitObjects/drawables/DrawableSliderRepeat';
import { DrawableSliderTail } from '../hitObjects/drawables/DrawableSliderTail';
import { DrawableSliderTick } from '../hitObjects/drawables/DrawableSliderTick';
import { DrawableSpinner } from '../hitObjects/drawables/DrawableSpinner';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';
import { SliderHeadCircle } from '../hitObjects/SliderHeadCircle';
import { SliderRepeat } from '../hitObjects/SliderRepeat';
import { SliderTailCircle } from '../hitObjects/SliderTailCircle';
import { SliderTick } from '../hitObjects/SliderTick';
import { Spinner } from '../hitObjects/Spinner';
import { DrawableJudgement } from './DrawableJudgement';
import { FollowPointRenderer } from './FollowPointRenderer';
import { StartTimeOrderedHitPolicy } from './StartTimeOrderedHitPolicy';

@provide(OsuPlayfield)
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

  protected override createLifeTimeEntry(hitObject: HitObject): HitObjectLifetimeEntry {
    return new OsuHitObjectLifetimeEntry(hitObject as OsuHitObject);
  }

  protected override onHitObjectAdded(hitObject: HitObject) {
    super.onHitObjectAdded(hitObject);
    this.followPoints.addFollowPoints(hitObject as OsuHitObject);
  }

  protected override onHitObjectRemoved(hitObject: HitObject) {
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

  protected override onNewDrawableHitObject(drawable: DrawableHitObject) {
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

  override get initialLifetimeOffset() {
    return this.hitObject.timePreempt;
  }
}
