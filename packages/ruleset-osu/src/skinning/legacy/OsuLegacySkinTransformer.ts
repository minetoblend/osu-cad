import type { LoadTextureEntry, Skin, SkinComponentLookup } from "@osucad/core";
import { SkinTransformer } from "@osucad/core";
import type { Drawable } from "@osucad/framework";
import { OsuSkinComponents } from "../OsuSkinComponents";
import { LegacyApproachCircle } from "./LegacyApproachCircle";
import { LegacyCirclePiece } from "./LegacyCirclePiece";
import { LegacyFollowCircle } from "./LegacyFollowCircle";
import { LegacySliderBall } from "./LegacySliderBall";
import { LegacySliderBody } from "./LegacySliderBody";

export class OsuLegacySkinTransformer extends SkinTransformer 
{
  private constructor(source: Skin) 
  {
    super(source);
  }

  override source!: Skin;

  public static async create(source: Skin) 
  {
    const skin = new OsuLegacySkinTransformer(source);

    await skin.load();

    return skin;
  }

  private async load() 
  {
    const entries: LoadTextureEntry[] = [
      "hitcircle",
      "hitcircleoverlay",
      "approachcircle",
      "sliderfollowcircle",
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
      {
        name: "followpoint",
        type: "animation",
      },
      {
        name: "sliderb",
        type: "animation",
        animationSeparator: "",
      },
      {
        name: "hit0",
        type: "animation",
      },
      {
        name: "hit50",
        type: "animation",
      },
      {
        name: "hit100",
        type: "animation",
      },
      {
        name: "hit300",
        type: "animation",
      },
    ];

    const hitCirclePrefix = this.source.getConfigValue("hitCirclePrefix") ?? "default";
    const scorePrefix = this.source.getConfigValue("scorePrefix") ?? "score";
    const comboPrefix = this.source.getConfigValue("comboPrefix") ?? "score";

    const prefixes = new Set([hitCirclePrefix, scorePrefix, comboPrefix]);

    for (const prefix of prefixes) 
    {
      for (let i = 0; i < 10; i++)
        entries.push(`${prefix}-${i}`);
    }

    await this.loadTextures(entries);
  }

  public override getDrawableComponent(lookup: SkinComponentLookup): Drawable | null 
  {
    switch (lookup) 
    {
    case OsuSkinComponents.FollowPoint:
      return this.getAnimation("followpoint", {
        animatable: true,
        looping: false,
        applyConfigFrameRate: true,
      });
    case OsuSkinComponents.CirclePiece:
      return new LegacyCirclePiece();
    case OsuSkinComponents.SliderHead:
      return new LegacyCirclePiece();
    case OsuSkinComponents.ApproachCircle:
      return new LegacyApproachCircle();
    case OsuSkinComponents.SliderBody:
      return new LegacySliderBody();
    case OsuSkinComponents.SliderBall:
      return new LegacySliderBall(this.getAnimation("sliderb", {
        animatable: true,
        looping: true,
        animationSeparator: "",
      }));
    case OsuSkinComponents.SliderFollowCircle: {
      const followCircleContent = this.getAnimation("sliderfollowcircle", {
        animatable: true,
        looping: true,
        applyConfigFrameRate: true,
      });

      if (followCircleContent)
        return new LegacyFollowCircle(followCircleContent);
    }
    }

    return super.getDrawableComponent(lookup);
  }
}
