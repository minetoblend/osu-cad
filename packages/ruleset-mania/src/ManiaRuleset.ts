import type { Beatmap, DrawableRuleset, HitObjectComposer, IBeatmap } from '@osucad/common';
import type { DifficultyCalculator } from 'packages/common/src/rulesets/difficulty/DifficultyCalculator';
import { Ruleset } from '@osucad/common';
import { DrawableManiaRuleset } from './DrawableManiaRuleset';
import { ManiaHitObjectComposer } from './edit/ManiaHitObjectComposer';
import { ManiaHitObjectParser } from './ManiaHitObjectParser';

export class ManiaRuleset extends Ruleset {
  override get shortName(): string {
    return 'mania';
  }

  override get legacyId(): number | null {
    return 3;
  }

  override createStableHitObjectParser(beatmap: Beatmap<any>): ManiaHitObjectParser {
    return new ManiaHitObjectParser(beatmap);
  }

  override createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return new DrawableManiaRuleset(this, beatmap);
  }

  override createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any> {
    return null;
  }

  override createHitObjectComposer(): HitObjectComposer {
    return new ManiaHitObjectComposer();
  }
}
