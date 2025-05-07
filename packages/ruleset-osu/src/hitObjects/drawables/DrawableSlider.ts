import type { ArmedState, DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, clamp, Container, provide } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { Slider } from "../Slider";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSliderBall } from "./DrawableSliderBall";
import { DrawableSliderHead } from "./DrawableSliderHead";
import { PlaySliderBody } from "./PlaySliderBody";
import { DrawableSliderTail } from "./DrawableSliderTail";
import { DrawableSliderRepeat } from "./DrawableSliderRepeat";
import { DrawableSliderTick } from "./DrawableSliderTick";

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

  public overlayElementContainer!: Container;

  private tailContainer!: Container<DrawableSliderTail>;
  private tickContainer!: Container<DrawableSliderTick>;
  private repeatContainer!: Container<DrawableSliderRepeat>;
  private headContainer!: Container<DrawableSliderHead>;

  body!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChildren = [
      this.body = new SkinnableDrawable(OsuSkinComponents.SliderBody),
      this.tailContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.tickContainer =  new Container({ relativeSizeAxes: Axes.Both }),
      this.repeatContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.headContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.overlayElementContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.ball,
    ];

    this.scaleBindable.addOnChangeListener(scale => this.ball.scale = scale.value);
  }

  protected override onApplied()
  {
    super.onApplied();

    this.pathVersion.bindTo(this.hitObject.path.version);
  }

  protected override onFreed()
  {
    super.onFreed();

    this.pathVersion.unbindFrom(this.hitObject.path.version);
    this.pathVersion.value = -1;
  }

  protected override clearNestedHitObjects()
  {
    super.clearNestedHitObjects();

    this.tailContainer.clear(false);
    this.tickContainer.clear(false);
    this.repeatContainer.clear(false);
    this.headContainer.clear(false);
  }

  protected override addNestedHitObject(hitObject: DrawableHitObject)
  {
    if (hitObject instanceof DrawableSliderHead)
    {
      this.headContainer.child = hitObject;
      return;
    }

    if (hitObject instanceof DrawableSliderTail)
    {
      this.tailContainer.child = hitObject;
      return;
    }

    if (hitObject instanceof DrawableSliderRepeat)
    {
      this.repeatContainer.add(hitObject);
      return;
    }

    if (hitObject instanceof DrawableSliderTick)
    {
      this.tickContainer.add(hitObject);
      return;
    }
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

    for (const repeat of this.repeatContainer.children)
    {
      repeat.updateSnakingPosition(this.hitObject.path.positionAt(this.sliderBody?.snakedStart ?? 0), this.hitObject.path.positionAt(this.sliderBody?.snakedEnd ?? 0));
    }
  }

  protected override updateInitialTransforms()
  {
    super.updateInitialTransforms();

    this.body.fadeInFromZero(this.hitObject.timeFadeIn);
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
