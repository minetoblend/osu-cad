import type { IKeyBinding } from 'osucad-framework';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { HitObjectComposer } from '../editor/screens/compose/HitObjectComposer';
import type { ISkin } from '../skinning/ISkin';
import type { SkinTransformer } from '../skinning/SkinTransformer';
import type { BeatmapVerifier } from '../verifier/BeatmapVerifier';
import type { DrawableRuleset } from './DrawableRuleset';

export abstract class Ruleset {
  createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    return null;
  }

  abstract createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset;

  createDrawableEditorRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return this.createDrawableRulesetWith(beatmap);
  }

  // TODO: ScoreProcessor

  // TODO: abstract createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any>;

  abstract createHitObjectComposer(): HitObjectComposer;

  postProcessBeatmap(beatmap: IBeatmap) {}

  abstract get shortName(): string;

  getDefaultKeyBindings(): IKeyBinding[] {
    return [];
  }

  createBeatmapVerifier(): BeatmapVerifier | null {
    return null;
  }

  // createEditorSetupSections
}
