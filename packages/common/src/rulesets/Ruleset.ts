import type { IKeyBinding } from 'osucad-framework';
import type { Beatmap } from '../beatmap/Beatmap';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { StableHitObjectParser } from '../beatmap/io/StableHitObjectParser';
import type { HitObjectComposer } from '../editor/screens/compose/HitObjectComposer';
import type { ISkin } from '../skinning/ISkin';
import type { SkinTransformer } from '../skinning/SkinTransformer';
import type { BeatmapVerifier } from '../verifier/BeatmapVerifier';
import type { DifficultyCalculator } from './difficulty/DifficultyCalculator';
import type { DrawableRuleset } from './DrawableRuleset';

export abstract class Ruleset {
  get legacyId(): number | null {
    return null;
  }

  createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    return null;
  }

  abstract createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset;

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

  // createEditorSetupSections
}
