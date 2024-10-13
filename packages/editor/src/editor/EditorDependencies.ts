import type { DifficultyInfo } from './EditorBeatmap';
import type { OsuPlayfield } from './hitobjects/OsuPlayfield';
import { Action, Bindable, BindableBoolean } from 'osucad-framework';
import { HitSoundState } from '../beatmap/hitSounds/BindableHitSound';
import { ToggleBindable } from './screens/compose/ToggleBindable';
import { EditorScreenType } from './screens/EditorScreenType';

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
  readonly showDifficultyOverlay = new BindableBoolean(false);
}
