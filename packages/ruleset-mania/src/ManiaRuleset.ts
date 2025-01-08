import type { Beatmap, DrawableRuleset, HitObjectComposer, IBeatmap } from '@osucad/common';
import type { DifficultyCalculator } from 'packages/common/src/rulesets/difficulty/DifficultyCalculator';
import type { ManiaHitObject } from './objects/ManiaHitObject';
import { Ruleset } from '@osucad/common';
import { ManiaHitObjectComposer } from './edit/ManiaHitObjectComposer';
import { ManiaHitObjectParser } from './ManiaHitObjectParser';
import { DrawableManiaRuleset } from './ui/DrawableManiaRuleset';

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
    return new DrawableManiaRuleset(this, beatmap as unknown as IBeatmap<ManiaHitObject>);
  }

  override createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any> {
    throw new Error('Not implemented');
  }

  override createHitObjectComposer(): HitObjectComposer {
    return new ManiaHitObjectComposer();
  }
}
