import { SkinComponentLookup } from "@osucad/core";

export class OsuSkinComponents extends SkinComponentLookup
{
  private constructor(readonly name: string)
  {
    super();
  }

  static readonly HitCircle = new OsuSkinComponents("HitCircle");
  static readonly ApproachCircle = new OsuSkinComponents("ApproachCircle");
  static readonly SliderBody = new OsuSkinComponents("SliderBody");
  static readonly SliderBall = new OsuSkinComponents("SliderBall");
  static readonly SliderFollowCircle = new OsuSkinComponents("SliderFollowCircle");
  static readonly SliderHeadHitCircle = new OsuSkinComponents("SliderHeadHitCircle");
  static readonly SliderTailHitCircle = new OsuSkinComponents("SliderTailHitCircle");
  static readonly ReverseArrow = new OsuSkinComponents("ReverseArrow");
  static readonly FollowPoint = new OsuSkinComponents("FollowPoint");
  static readonly SpinnerBody = new OsuSkinComponents("SpinnerBody");
  static readonly HitCircleText = new OsuSkinComponents("HitCircleText");
  static readonly Cursor = new OsuSkinComponents("Cursor");
  static readonly CursorTrail = new OsuSkinComponents("CursorTrail");
  static readonly CursorParticles = new OsuSkinComponents("CursorParticles");
}
