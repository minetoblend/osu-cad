import { Skin } from "src/skinning/Skin";
import { RulesetBeatmapParser } from "../beatmaps/parsing/BeatmapParser";
import { SkinTransformer } from "../skinning/SkinTransformer";
import { Awaitable } from "../utils";
import { BeatmapPostProcessor } from "./BeatmapPostProcessor";
import { DrawableRuleset } from "./ui/DrawableRuleset";

export interface Ruleset extends OsucadMixins.Ruleset 
{
  readonly id: string;
  readonly title: string;

  readonly legacyId?: number;

  createDrawableRuleset(): Awaitable<DrawableRuleset>

  createBeatmapParser?(): Awaitable<RulesetBeatmapParser>

  createSkinTransformer?(skin: Skin): Awaitable<SkinTransformer | null>;

  createBeatmapPostProcessor?(): Awaitable<BeatmapPostProcessor>
}
