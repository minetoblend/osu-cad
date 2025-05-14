import type { Skin, SkinComponentLookup } from "@osucad/core";
import { SkinTextureStore, SkinTransformer } from "@osucad/core";
import { computed, type Drawable } from "@osucad/framework";
import { OsuSkinComponents } from "../OsuSkinComponents";
import { LegacyApproachCircle } from "./LegacyApproachCircle";
import { LegacyCirclePiece } from "./LegacyCirclePiece";
import { LegacyFollowCircle } from "./LegacyFollowCircle2";
import { LegacySliderBall } from "./LegacySliderBall";
import { LegacySliderBody } from "./LegacySliderBody";
import { LegacySliderHeadHitCircle } from "./LegacySliderHeadHitCircle";
import { LegacyReverseArrow } from "./LegacyReverseArrow";

export class OsuLegacySkinTransformer extends SkinTransformer
{
  private constructor(source: Skin)
  {
    super(source);

    this.textureStore = new SkinTextureStore(source, computed(() =>
    {
      const textureNames = new Set([
        "hitcircle",
        "hitcircleoverlay",
        "approachcircle",
        "sliderscorepoint",
        "sliderstartcircle",
        "sliderstartcircleoverlay",
        "sliderendcircle",
        "sliderendcircleoverlay",
        "reversearrow",
        "sliderb-spec",
        "hitcircleselect",
        "spinner-approachcircle",
        "spinner-background",
        "spinner-bottom",
        "spinner-glow",
        "spinner-middle",
        "spinner-middle2",
        "spinner-top",
        "cursor",
        "cursortrail",
      ]);

      const hitCirclePrefix = this.getConfig("hitCirclePrefix") ?? "default";
      const scorePrefix = this.getConfig("scorePrefix") ?? "score";

      for (let i = 0; i < 10; i++)
        textureNames.add(`${hitCirclePrefix}-${i}`);

      for (let i = 0; i < 10; i++)
        textureNames.add(`${scorePrefix}-${i}`);

      return {
        textures: [...textureNames],
        animations: [
          {
            name: "followpoint",
            looping: false,
            applyConfigFrameRate: true,
            startAtCurrentTime: false,
          },
          {
            name: "sliderb",
            animationSeparator: "",
            looping: true,
          },
          {
            name: "sliderfollowcircle",
            looping: true,
            applyConfigFrameRate: true,
          },
          {
            name: "hit0",
          },
          {
            name: "hit50",
          },
          {
            name: "hit100",
          },
          {
            name: "hit300",
          },
        ],
      };
    }));
  }

  readonly textureStore: SkinTextureStore;

  public static async create(source: Skin)
  {
    const skin = new OsuLegacySkinTransformer(source);

    await skin.load();

    return skin;
  }

  private async load()
  {
    await Promise.all([
      this.source.samples.loadAll(),
      this.textureStore.load(),
    ]);

    this.textureStore.textureChanged.addListener(() => this.texturesChanged.emit());
  }

  override getTexture(componentName: string)
  {
    return this.textureStore.getTexture(componentName) ?? this.source.getTexture(componentName);
  }

  getAnimation(name: string)
  {
    return this.textureStore.getAnimation(name);
  }

  public override getDrawableComponent(lookup: SkinComponentLookup): Drawable | null
  {
    if (lookup instanceof OsuSkinComponents)
    {

      switch (lookup)
      {
      case OsuSkinComponents.FollowPoint:
        return this.getAnimation("followpoint");
      case OsuSkinComponents.HitCircle:
        return new LegacyCirclePiece();
      case OsuSkinComponents.SliderTailHitCircle:
        return new LegacyCirclePiece("sliderendcircle", false);
      case OsuSkinComponents.SliderHeadHitCircle:
        return new LegacySliderHeadHitCircle();
      case OsuSkinComponents.ApproachCircle:
        return new LegacyApproachCircle();
      case OsuSkinComponents.SliderBody:
        return new LegacySliderBody();
      case OsuSkinComponents.ReverseArrow:
        return new LegacyReverseArrow();
      case OsuSkinComponents.SliderBall:
        return new LegacySliderBall(this.getAnimation("sliderb"));
      case OsuSkinComponents.SliderFollowCircle: {
        const followCircleContent = this.getAnimation("sliderfollowcircle");

        // TODO: logic is actually supposed to be different here
        if (followCircleContent)
          return new LegacyFollowCircle(followCircleContent);
      }
      }
    }

    return super.getDrawableComponent(lookup);
  }
}
