import type { BeatmapPostProcessor, DrawableRuleset, DrawableRulesetOptions, Ruleset, RulesetBeatmapParser, Skin, SkinTransformer } from "@osucad/core";
import type { OsuHitObjectComposer } from "./edit";
import type { EditorRuleset } from "@osucad/editor";

export class OsuRuleset implements Ruleset
{
  public readonly id = "osu";
  public readonly title = "osu!";
  public readonly legacyId = 0;

  public async createDrawableRuleset(options: DrawableRulesetOptions): Promise<DrawableRuleset>
  {
    const { DrawableOsuRuleset } = await import("./ui/DrawableOsuRuleset");
    return new DrawableOsuRuleset(options);
  }

  public async createBeatmapParser(): Promise<RulesetBeatmapParser>
  {
    const { OsuBeatmapParser } = await import("./beatmaps/OsuBeatmapParser");
    return new OsuBeatmapParser();
  }

  public async createSkinTransformer(skin: Skin): Promise<SkinTransformer | null>
  {
    const module = await import("./skinning/legacy/OsuLegacySkinTransformer");

    const { OsuLegacySkinTransformer } = module;
    return await OsuLegacySkinTransformer.create(skin);
  }

  public async createBeatmapPostProcessor(): Promise<BeatmapPostProcessor>
  {
    const { OsuBeatmapPostProcessor } = await import("./OsuBeatmapPostProcessor");
    return new OsuBeatmapPostProcessor();
  }

  public async createHitObjectComposer(): Promise<OsuHitObjectComposer>
  {
    const { OsuHitObjectComposer } = await import("./edit/OsuHitObjectComposer");

    return new OsuHitObjectComposer();
  }

  public async createEditorRuleset(): Promise<EditorRuleset>
  {
    const { OsuEditorRuleset } = await import("./edit/OsuEditorRuleset");

    return new OsuEditorRuleset();
  }
}
