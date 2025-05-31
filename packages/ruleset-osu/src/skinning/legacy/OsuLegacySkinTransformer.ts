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
import { LegacyOldStyleSpinner } from "./LegacyOldStyleSpinner";
import { LegacyFont } from "../../LegacyFont";
import { getFontPrefix, LegacySpriteText } from "../../LegacySpriteText";
import { OsuHitObject } from "../../hitObjects/OsuHitObject";

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
        "spinner-circle",
        "spinner-metre",
        "spinner-rpm",
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
      case OsuSkinComponents.SpinnerBody:
        return new LegacyOldStyleSpinner();
      case OsuSkinComponents.SliderBall:
        return new LegacySliderBall(this.getAnimation("sliderb"));
      case OsuSkinComponents.HitCircleText: {
        if (!this.hasFont(LegacyFont.HitCircle))
          return null;

        const hitcircle_text_scale = 0.8;
        return new LegacySpriteText(
            {
              font: LegacyFont.HitCircle,
              // stable applies a blanket 0.8x scale to hitcircle fonts
              scale: hitcircle_text_scale,
              maxSizePerGlyph: OsuHitObject.OBJECT_DIMENSIONS.scale(2 / hitcircle_text_scale),
            });
      }


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

  hasFont(font: LegacyFont)
  {
    return this.getTexture(`${getFontPrefix(this, font)}-0`) !== null;
  }
}
