import type { IKeyBinding } from 'osucad-framework';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { ISkin } from '../skinning/ISkin';
import type { SkinTransformer } from '../skinning/SkinTransformer';
import type { DrawableRuleset } from './DrawableRuleset';

export abstract class Ruleset {
  createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    return null;
  }

  abstract createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset;

  // TODO: ScoreProcessor

  // TODO: abstract createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any>;

  // TODO: createHitObjectComposer

  abstract get shortName(): string;

  getDefaultKeyBindings(): IKeyBinding[] {
    return [];
  }

  // createEditorSetupSections
}
