import type { Beatmap, BeatmapConverter, BeatmapProcessor, DifficultyCalculator, DrawableRuleset, EditorRuleset, HitObject, HitObjectComposer, IBeatmap, ISkin, NoArgsConstructor, SkinTransformer } from '@osucad/common';
import type { IKeyBinding } from 'osucad-framework';
import { Ruleset, StableSkin } from '@osucad/common';
import { InputKey, KeyBinding, KeyCombination } from 'osucad-framework';
import { OsuBeatmapConverter } from './beatmaps/OsuBeatmapConverter';
import { ComboProcessor } from './ComboProcessor';
import { OsuDifficultyCalculator } from './difficulty/OsuDifficultyCalculator';
import { DrawableOsuEditorRuleset } from './DrawableOsuEditorRuleset';
import { DrawableOsuRuleset } from './DrawableOsuRuleset';
import { BeatmapComboProcessor } from './edit/BeatmapComboProcessor';
import { OsuHitObjectComposer } from './edit/OsuHitObjectComposer';
import { HitCircle } from './hitObjects/HitCircle';
import { Slider } from './hitObjects/Slider';
import { Spinner } from './hitObjects/Spinner';
import { OsuAction } from './OsuAction';
import { OsuEditorRuleset } from './OsuEditorRuleset';
import { StableOsuSkinTransformer } from './skinning/stable/StableOsuSkinTransformer';
import { StackingProcessor } from './StackingProcessor';
import { OsuBeatmapVerifier } from './verify/OsuBeatmapVerifier';

export class OsuRuleset extends Ruleset {
  override get legacyId(): number | null {
    return 0;
  }

  override createEditorRuleset(): EditorRuleset {
    return new OsuEditorRuleset(this);
  }

  override createDrawableRulesetWith(beatmap: IBeatmap) {
    return new DrawableOsuRuleset(this, beatmap as IBeatmap<any>);
  }

  override createDrawableEditorRulesetWith(beatmap: IBeatmap): DrawableRuleset {
    return new DrawableOsuEditorRuleset(this, beatmap as IBeatmap<any>);
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

  override postProcessBeatmap(beatmap: IBeatmap) {
    super.postProcessBeatmap(beatmap);

    new StackingProcessor().applyToBeatmap(beatmap);
    new ComboProcessor().applyToBeatmap(beatmap);
  }

  override createBeatmapConverter(beatmap: IBeatmap): BeatmapConverter<any> {
    return new OsuBeatmapConverter(beatmap, this);
  }

  override createDifficultyCalculator(beatmap: Beatmap): DifficultyCalculator<any> {
    return new OsuDifficultyCalculator(beatmap);
  }

  override createBeatmapVerifier(): OsuBeatmapVerifier {
    return new OsuBeatmapVerifier();
  }

  override createEditorBeatmapProcessors(): BeatmapProcessor[] {
    return [
      new BeatmapComboProcessor(),
    ];
  }

  override getHitObjectClasses(): Record<string, NoArgsConstructor<HitObject>> {
    return { HitCircle, Slider, Spinner };
  }
}
