import { ArmedState, HitSampleInfo, ShakeContainer, SkinnableDrawable } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { HitCircle } from "../HitCircle";
import { OsuHitObject } from "../OsuHitObject";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";

export class DrawableHitCircle extends DrawableOsuHitObject<HitCircle>
{
  constructor(initialHitObject?: HitCircle)
  {
    super(initialHitObject);

    this.origin = Anchor.Center;
  }

  private circlePiece!: SkinnableDrawable;
  private approachCircle!: SkinnableDrawable;
  private shakeContainer!: ShakeContainer;

  get proxiedLayer()
  {
    return this.approachCircle;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.internalChildren = [
      this.shakeContainer = new ShakeContainer({
        shakeDuration: 30,
        relativeSizeAxes: Axes.Both,
        children: [
          this.circlePiece = new SkinnableDrawable(this.componentLookup).with({
            relativeSizeAxes: Axes.Both,
            alpha: 0,
          }),
          this.approachCircle = new ProxyableSkinnableDrawable(OsuSkinComponents.ApproachCircle).with({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0,
            scale: 4,
          }),
        ],
      }),
    ];
  }

  protected override get initialLifetimeOffset(): number
  {
    return this.hitObject.timePreempt;
  }

  protected override updateInitialTransforms()
  {
    this.circlePiece.fadeInFromZero(this.hitObject.timeFadeIn);

    this.approachCircle.fadeTo(0.9, Math.min(this.hitObject.timeFadeIn * 2, this.hitObject.timePreempt));
    this.approachCircle.scaleTo(1, this.hitObject.timePreempt);
    this.approachCircle.expire(true);
  }

  protected override updateStartTimeTransforms()
  {
    super.updateStartTimeTransforms();

    this.approachCircle.fadeOut(50);
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    this.delay(800).fadeOut();

    switch (state)
    {
    case ArmedState.Idle:
      break;
    case ArmedState.Miss:
      this.fadeOut(100);
      break;
    default:
      this.approachCircle.fadeOut();
    }

    this.expire();
  }

  protected override updatePosition()
  {
    this.position = this.hitObject.stackedPosition;
  }

  protected override updateScale()
  {
    this.scale = this.hitObject.scale;
  }

  protected get componentLookup(): OsuSkinComponents
  {
    return OsuSkinComponents.HitCircle;
  }

  public override update()
  {
    super.update();
  }

  public override shake(): void
  {
    this.shakeContainer.shake();
  }

  protected override playSamples()
  {
    const sample = this.skin.getSample(new HitSampleInfo(HitSampleInfo.HIT_NORMAL, HitSampleInfo.BANK_SOFT));

    if (sample)
      sample.play();
  }
}

class ProxyableSkinnableDrawable extends SkinnableDrawable
{
  override get removeWhenNotAlive()
  {
    return false;
  }
}
