import type { ArmedState } from "@osucad/core";
import { HitSampleInfo, SkinnableDrawable } from "@osucad/core";
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

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.internalChildren = [
      this.circlePiece = new SkinnableDrawable(OsuSkinComponents.CirclePiece).with({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
      this.approachCircle = new SkinnableDrawable(OsuSkinComponents.ApproachCircle).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0,
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

    this.approachCircle.fadeOut().fadeTo(0.9, Math.min(this.hitObject.timeFadeIn * 2, this.hitObject.timePreempt));
    this.approachCircle.scaleTo(4).scaleTo(1, this.hitObject.timePreempt);
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    this.circlePiece.fadeOut(700);
    this.approachCircle.fadeOut();

    this.delay(800).fadeOut();
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
    return OsuSkinComponents.CirclePiece;
  }

  public override update()
  {
    super.update();

    if (this.time.current < this.hitStateUpdateTime && this.time.current + this.time.elapsed > this.hitStateUpdateTime)
    {
      const sample = this.skin.getSample(
          new HitSampleInfo(HitSampleInfo.HIT_NORMAL, HitSampleInfo.BANK_SOFT),
      );

      if (sample)
        sample.play();
    }
  }
}
