import type { BeatmapPostProcessor, DrawableRuleset, Ruleset, RulesetBeatmapParser, Skin, SkinTransformer } from "@osucad/core";

export class OsuRuleset implements Ruleset
{
  readonly id = "osu";
  readonly title = "osu!";
  readonly legacyId = 0;

  public async createDrawableRuleset(): Promise<DrawableRuleset>
  {
    const { DrawableOsuRuleset } = await import("./ui/DrawableOsuRuleset");
    return new DrawableOsuRuleset();
  }

  public async createBeatmapParser(): Promise<RulesetBeatmapParser>
  {
    const { OsuBeatmapParser } = await import("./beatmaps/OsuBeatmapParser");
    return new OsuBeatmapParser();
  }

  public async createSkinTransformer(skin: Skin): Promise<SkinTransformer | null>
  {
    const module = await import("./skinning/legacy/OsuLegacySkinTransformer");
    console.log(module);

    const { OsuLegacySkinTransformer } = module;
    return await OsuLegacySkinTransformer.create(skin);
  }

  public async createBeatmapPostProcessor(): Promise<BeatmapPostProcessor>
  {
    const { OsuBeatmapPostProcessor } = await import("./OsuBeatmapPostProcessor");
    return new OsuBeatmapPostProcessor();
  }
}
