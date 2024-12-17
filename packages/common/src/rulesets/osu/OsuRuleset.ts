import type { IKeyBinding } from 'osucad-framework';
import type { IBeatmap } from '../../beatmap';
import type { HitObjectComposer } from '../../editor/HitObjectComposer';
import type { ISkin } from '../../skinning/ISkin';
import type { SkinTransformer } from '../../skinning/SkinTransformer';
import { InputKey, KeyBinding, KeyCombination } from 'osucad-framework';
import { StableSkin } from '../../skinning/stable/StableSkin';
import { Ruleset } from '../Ruleset';
import { DrawableOsuRuleset } from './DrawableOsuRuleset';
import { OsuHitObjectComposer } from './edit/OsuHitObjectComposer';
import { OsuAction } from './OsuAction';
import { StableOsuSkinTransformer } from './skinning/stable/StableOsuSkinTransformer';

export class OsuRuleset extends Ruleset {
  override createDrawableRulesetWith(beatmap: IBeatmap) {
    return new DrawableOsuRuleset(this, beatmap);
  }

  override get shortName(): string {
    return 'osu';
  }

  override createHitObjectComposer(): HitObjectComposer {
    return new OsuHitObjectComposer();
  }

  override getDefaultKeyBindings(): IKeyBinding[] {
    return [
      new KeyBinding(KeyCombination.from(InputKey.X), OsuAction.LeftButton),
      new KeyBinding(KeyCombination.from(InputKey.V), OsuAction.LeftButton),
    ];
  }

  override createSkinTransformer(skin: ISkin, beatmap: IBeatmap): SkinTransformer | null {
    if (skin instanceof StableSkin)
      return new StableOsuSkinTransformer(skin);

    return null;
  }
}
