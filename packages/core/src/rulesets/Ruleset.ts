import type { IKeyBinding, NoArgsConstructor } from '@osucad/framework';
import type { BeatmapConverter } from '../beatmap/BeatmapConverter';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { StableHitObjectParser } from '../beatmap/io/StableHitObjectParser';
import type { BeatmapProcessor } from '../beatmap/processors/BeatmapProcessor';
import type { HitObjectComposer } from '../editor/screens/compose/HitObjectComposer';
import type { HitObject } from '../hitObjects/HitObject';
import type { ISkin } from '../skinning/ISkin';
import type { SkinTransformer } from '../skinning/SkinTransformer';
import type { BeatmapVerifier } from '../verifier/BeatmapVerifier';
import type { DifficultyCalculator } from './difficulty/DifficultyCalculator';
import type { DrawableRuleset } from './DrawableRuleset';
import type { EditorRuleset } from './EditorRuleset';
import { Beatmap } from '../beatmap/Beatmap';
import { RulesetInfo } from './RulesetInfo';

export abstract class Ruleset {
  get legacyId(): number | null {
    return null;
  }

  createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    return null;
  }

  createBeatmap(): Beatmap<any> {
    return new Beatmap();
  }

  abstract getHitObjectClasses(): Record<string, NoArgsConstructor<HitObject>>;

  abstract createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset;

  abstract createBeatmapConverter(beatmap: IBeatmap): BeatmapConverter<any>;

  abstract createEditorRuleset(): EditorRuleset;

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
