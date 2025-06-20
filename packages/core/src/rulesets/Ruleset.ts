import type { Skin } from "src/skinning/Skin";
import type { RulesetBeatmapParser } from "../beatmaps/parsing/BeatmapParser";
import type { SkinTransformer } from "../skinning/SkinTransformer";
import type { Awaitable } from "../utils";
import type { BeatmapPostProcessor } from "./BeatmapPostProcessor";
import type { DrawableRuleset } from "./ui/DrawableRuleset";
import type { GameplayProcessor } from "./ui/GameplayProcessor";
import { injectionToken } from "@osucad/framework";

export interface Ruleset extends OsucadMixins.Ruleset
{
  readonly id: string;
  readonly title: string;

  readonly legacyId?: number;

  createDrawableRuleset(): Awaitable<DrawableRuleset>

  createBeatmapParser?(): Awaitable<RulesetBeatmapParser>

  createSkinTransformer?(skin: Skin): Awaitable<SkinTransformer | null>;

  createBeatmapPostProcessor?(): Awaitable<BeatmapPostProcessor>

  createAutoGameplayProcessor?(): Awaitable<GameplayProcessor>
}

export const Ruleset = injectionToken<Ruleset>("Ruleset");
