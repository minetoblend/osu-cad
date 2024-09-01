import { Anchor, Axes, Container, clamp, dependencyLoader } from 'osucad-framework';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import type { DrawableHitObject } from './DrawableHitObject';
import { DrawableSliderBody } from './DrawableSliderBody';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { DrawableSliderBall } from './DrawableSliderBall';

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

  @dependencyLoader()
  load() {
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

  protected override updateEndTimeTransforms() {
    super.updateEndTimeTransforms();

    this.fadeOut(700);
    this.expire();
  }

  protected addNestedHitObject(hitObject: DrawableHitObject) {
    super.addNestedHitObject(hitObject);

    switch (hitObject.constructor) {
      case DrawableSliderHead:
        this.#headContainer.child = hitObject;
        break;
      case DrawableSliderTail:
        this.#tailContainer.child = hitObject;
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
  }
}
