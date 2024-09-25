import type { Slider } from '../../beatmap/hitObjects/Slider';
import type { DrawableHitObject } from './DrawableHitObject';
import { Anchor, Axes, Bindable, clamp, Container, dependencyLoader, resolved, Vec2 } from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import { DrawableSliderBall } from './DrawableSliderBall';
import { DrawableSliderBody } from './DrawableSliderBody';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';

export class DrawableSlider extends DrawableOsuHitObject<Slider> {
  constructor() {
    super();
    this.origin = Anchor.Center;

    this.ball = new DrawableSliderBall();
    this.ball.alwaysPresent = true;
    this.ball.alpha = 0;
    this.ball.bypassAutoSizeAxes = Axes.Both;
  }

  body!: DrawableSliderBody;

  readonly ball: DrawableSliderBall;

  #headContainer!: Container;
  #tailContainer!: Container;
  #tickContainer!: Container;
  #repeatContainer!: Container;

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimationsEnabled);

    this.addAllInternal(
      this.body = new DrawableSliderBody().with({
        alpha: 0,
      }),
      this.#tailContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#tickContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#repeatContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#headContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.ball,
    );

    this.positionBindable.addOnChangeListener(() => this.position = this.hitObject!.stackedPosition);
    this.stackHeightBindable.addOnChangeListener(() => this.position = this.hitObject!.stackedPosition);
    this.scaleBindable.addOnChangeListener(scale => this.ball.scale = scale.value);
  }

  onApplied() {
    super.onApplied();

    this.body.hitObject = this.hitObject!;
  }

  onFreed() {
    super.onFreed();

    this.body.hitObject = undefined;
  }

  protected updateInitialTransforms() {
    this.body.fadeInFromZero(this.hitObject!.timeFadeIn);
  }

  protected updateStartTimeTransforms() {
    super.updateStartTimeTransforms();

    this.ball.fadeIn();
    this.ball.scaleTo(this.hitObject!.scale);
  }

  hitAnimationsEnabled = new Bindable(false);

  protected override updateEndTimeTransforms() {
    super.updateEndTimeTransforms();

    this.fadeOut(this.hitAnimationsEnabled.value ? 240 : 700);
    this.expire();
  }

  protected addNestedHitObject(hitObject: DrawableHitObject) {
    super.addNestedHitObject(hitObject);

    switch (hitObject.constructor) {
      case DrawableSliderHead:
        this.#headContainer.add(hitObject);
        break;
      case DrawableSliderTail:
        this.#tailContainer.add(hitObject);
        break;
      case DrawableSliderTick:
        this.#tickContainer.add(hitObject);
        break;
      case DrawableSliderRepeat:
        hitObject.depth = (hitObject as DrawableSliderRepeat).hitObject!.repeatIndex;
        this.#repeatContainer.add(hitObject);
        break;
    }
  }

  protected clearNestedHitObjects() {
    super.clearNestedHitObjects();

    this.#headContainer.clear(false);
    this.#tailContainer.clear(false);
    this.#tickContainer.clear(false);
    this.#repeatContainer.clear(false);
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    const completionProgress = clamp((this.time.current - this.hitObject!.startTime) / this.hitObject!.duration, 0, 1);

    this.ball.updateProgress(completionProgress);

    const start = new Vec2();
    const end = this.hitObject!.path.endPosition;

    for (const h of this.#repeatContainer.children as DrawableSliderRepeat[]) {
      h.updatePosition(start, end);
    }
  }
}
