import type { ArmedState } from "@osucad/core";
import { SkinnableDrawable, SyntheticHitObjectEntry } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, clamp, provide } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { Slider } from "../Slider";
import type { DrawableHitCircle } from "./DrawableHitCircle";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSliderBall } from "./DrawableSliderBall";
import { DrawableSliderHead } from "./DrawableSliderHead";
import { PlaySliderBody } from "./PlaySliderBody";

@provide(DrawableSlider)
export class DrawableSlider extends DrawableOsuHitObject<Slider>
{
  constructor()
  {
    super();

    this.origin = Anchor.Center;

    this.ball = new DrawableSliderBall();
    this.ball.alwaysPresent = true;
    this.ball.alpha = 0;
    this.ball.bypassAutoSizeAxes = Axes.Both;
  }

  readonly snakingIn = new Bindable(false);
  readonly snakingOut = new Bindable(false);

  readonly pathVersion = new Bindable(-1);

  readonly ball: DrawableSliderBall;

  sliderHead!: DrawableSliderHead;

  body!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChildren = [
      this.body = new SkinnableDrawable(OsuSkinComponents.SliderBody),
      this.sliderHead = new DrawableSliderHead(),
      this.ball,
    ];

    this.scaleBindable.addOnChangeListener(scale => this.ball.scale = scale.value);
  }

  protected override onApplied()
  {
    super.onApplied();

    this.pathVersion.bindTo(this.hitObject.path.version);
    this.sliderHead.entry = new SyntheticHitObjectEntry(this.hitObject.headCircle);
  }

  protected override onFreed()
  {
    super.onFreed();

    this.pathVersion.unbindFrom(this.hitObject.path.version);
    this.pathVersion.value = -1;
    this.sliderHead.entry = null;
  }

  protected override updatePosition(): void
  {
    this.position = this.hitObject.stackedPosition;
  }

  protected override updateScale(): void
  {
  }

  get sliderBody(): PlaySliderBody | null
  {
    if (this.body.drawable instanceof PlaySliderBody)
      return this.body.drawable;
    return null;
  }

  public override updateAfterChildren()
  {
    super.updateAfterChildren();

    const completionProgress = clamp((this.time.current - this.hitObject.startTime) / this.hitObject.duration, 0, 1);

    this.ball.updateProgress(completionProgress);
    this.sliderBody?.updateProgress(completionProgress);
  }

  protected override updateStartTimeTransforms()
  {
    super.updateStartTimeTransforms();

    this.ball.fadeIn();
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    this.fadeOut(240);
    this.expire();
  }
}
