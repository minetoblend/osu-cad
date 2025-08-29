import { SkinComponentLookup } from "@osucad/core";

export class OsuSkinComponents extends SkinComponentLookup
{
  private constructor(public readonly name: string)
  {
    super();
  }

  public static readonly HitCircle = new OsuSkinComponents("HitCircle");
  public static readonly ApproachCircle = new OsuSkinComponents("ApproachCircle");
  public static readonly SliderBody = new OsuSkinComponents("SliderBody");
  public static readonly SliderBall = new OsuSkinComponents("SliderBall");
  public static readonly SliderFollowCircle = new OsuSkinComponents("SliderFollowCircle");
  public static readonly SliderHeadHitCircle = new OsuSkinComponents("SliderHeadHitCircle");
  public static readonly SliderTailHitCircle = new OsuSkinComponents("SliderTailHitCircle");
  public static readonly ReverseArrow = new OsuSkinComponents("ReverseArrow");
  public static readonly FollowPoint = new OsuSkinComponents("FollowPoint");
  public static readonly SpinnerBody = new OsuSkinComponents("SpinnerBody");
  public static readonly HitCircleText = new OsuSkinComponents("HitCircleText");
  public static readonly Cursor = new OsuSkinComponents("Cursor");
  public static readonly CursorTrail = new OsuSkinComponents("CursorTrail");
  public static readonly CursorParticles = new OsuSkinComponents("CursorParticles");
  public static readonly HitCircleSelect = new OsuSkinComponents("HitCircleSelect");
}
