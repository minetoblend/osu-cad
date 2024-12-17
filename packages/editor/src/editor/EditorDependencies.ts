import type { OsuPlayfield } from '@osucad/common';
import { Action, Bindable, BindableBoolean } from 'osucad-framework';
import { HitSoundState } from '../beatmap/hitSounds/BindableHitSound';
import { ToggleBindable } from './screens/compose/ToggleBindable';
import { EditorScreenType } from './screens/EditorScreenType';

export class EditorDependencies {
  constructor(
    readonly reusablePlayfield: OsuPlayfield,
  ) {
  }

  readonly newCombo = new ToggleBindable(false);
  readonly newComboApplied = new Action<boolean>();
  readonly hitSound = new HitSoundState();
  readonly currentScreen = new Bindable(EditorScreenType.Compose);
  readonly showDifficultyOverlay = new BindableBoolean(false);
}
