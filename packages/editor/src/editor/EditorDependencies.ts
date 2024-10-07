import type { DifficultyInfo } from './EditorBeatmap.ts';
import type { OsuPlayfield } from './hitobjects/OsuPlayfield.ts';
import { Action, Bindable } from 'osucad-framework';
import { HitSoundState } from '../beatmap/hitSounds/BindableHitSound.ts';
import { ToggleBindable } from './screens/compose/ToggleBindable.ts';
import { EditorScreenType } from './screens/EditorScreenType.ts';

export class EditorDependencies {
  constructor(
    readonly reusablePlayfield: OsuPlayfield,
    readonly otherDifficulties: DifficultyInfo[],
  ) {
    this.secondaryDifficulty = new Bindable<DifficultyInfo | null>(otherDifficulties[0] ?? null);
  }

  readonly newCombo = new ToggleBindable(false);
  readonly newComboApplied = new Action<boolean>();
  readonly hitSound = new HitSoundState();
  readonly currentScreen = new Bindable(EditorScreenType.Compose);
  readonly secondaryDifficulty: Bindable<DifficultyInfo | null>;
}
