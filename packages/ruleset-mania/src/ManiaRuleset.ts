import type { Beatmap, BeatmapConverter, DrawableRuleset, EditorRuleset, HitObjectComposer, IBeatmap, ISkin, SkinTransformer } from '@osucad/common';
import type { IKeyBinding } from 'osucad-framework';
import type { DifficultyCalculator } from 'packages/common/src/rulesets/difficulty/DifficultyCalculator';
import type { ManiaBeatmap } from './beatmaps/ManiaBeatmap';
import { Ruleset } from '@osucad/common';
import { InputKey, KeyBinding } from 'osucad-framework';
import { ManiaHitObjectComposer } from './edit/ManiaHitObjectComposer';
import { ManiaBeatmapConverter } from './ManiaBeatmapConverter';
import { ManiaEditorRuleset } from './ManiaEditorRuleset';
import { ArgonManiaSkinTransformer } from './skinning/argon/ArgonManiaSkinTransformer';
import { DrawableManiaEditorRuleset } from './ui/DrawableManiaEditorRuleset';
import { DrawableManiaRuleset } from './ui/DrawableManiaRuleset';
import { ManiaAction } from './ui/ManiaAction';

export class ManiaRuleset extends Ruleset {
  override get shortName(): string {
    return 'mania';
  }

  override get legacyId(): number | null {
    return 3;
  }

  override createDrawableRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return new DrawableManiaRuleset(this, beatmap as unknown as ManiaBeatmap);
  }

  override createDrawableEditorRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return new DrawableManiaEditorRuleset(this, beatmap as unknown as ManiaBeatmap);
  }

  override createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any> {
    throw new Error('Not implemented');
  }

  override createHitObjectComposer(): HitObjectComposer {
    return new ManiaHitObjectComposer();
  }

  override getDefaultKeyBindings(): IKeyBinding[] {
    return [
      KeyBinding.from(InputKey.D, ManiaAction.Key1),
      KeyBinding.from(InputKey.F, ManiaAction.Key2),
      KeyBinding.from(InputKey.J, ManiaAction.Key3),
      KeyBinding.from(InputKey.K, ManiaAction.Key4),
    ];
  }

  override createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer {
    return new ArgonManiaSkinTransformer(skin, beatmap);
  }

  override createBeatmapConverter(beatmap: IBeatmap): BeatmapConverter<any> {
    return new ManiaBeatmapConverter(beatmap, this);
  }

  override createEditorRuleset(): EditorRuleset {
    return new ManiaEditorRuleset(this);
  }
}
