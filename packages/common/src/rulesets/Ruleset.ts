import type { IKeyBinding } from 'osucad-framework';
import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapConverter } from '../beatmap/BeatmapConverter';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { StableHitObjectParser } from '../beatmap/io/StableHitObjectParser';
import type { BeatmapProcessor } from '../beatmap/processors/BeatmapProcessor';
import type { HitObjectComposer } from '../editor/screens/compose/HitObjectComposer';
import type { TimelineHitObjectBlueprintContainer } from '../editor/ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import type { ISkin } from '../skinning/ISkin';
import type { SkinTransformer } from '../skinning/SkinTransformer';
import type { BeatmapVerifier } from '../verifier/BeatmapVerifier';
import type { DifficultyCalculator } from './difficulty/DifficultyCalculator';
import type { DrawableRuleset } from './DrawableRuleset';
import { RulesetInfo } from './RulesetInfo';

export abstract class Ruleset {
  get legacyId(): number | null {
    return null;
  }

  createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    return null;
  }

  abstract createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset;

  abstract createBeatmapConverter(beatmap: IBeatmap): BeatmapConverter<any>;

  createTimelineHitObjectContainer(): TimelineHitObjectBlueprintContainer | null {
    return null;
  }

  createEditorBeatmapProcessors(): BeatmapProcessor[] {
    return [];
  }

  createStableHitObjectParser(beatmap: Beatmap<any>): StableHitObjectParser<any> | null {
    return null;
  }

  createDrawableEditorRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return this.createDrawableRulesetWith(beatmap);
  }

  // TODO: ScoreProcessor

  abstract createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any>;

  abstract createHitObjectComposer(): HitObjectComposer;

  postProcessBeatmap(beatmap: IBeatmap) {}

  abstract get shortName(): string;

  getDefaultKeyBindings(): IKeyBinding[] {
    return [];
  }

  createBeatmapVerifier(): BeatmapVerifier<any> | null {
    return null;
  }

  get rulesetInfo(): RulesetInfo {
    return new RulesetInfo(this.shortName, this.shortName, this.constructor as any);
  }

  // createEditorSetupSections
}
