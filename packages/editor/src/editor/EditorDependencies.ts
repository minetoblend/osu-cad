import type { OsuPlayfield } from './hitobjects/OsuPlayfield.ts';
import { Action, Bindable } from 'osucad-framework';
import { HitSoundState } from '../beatmap/hitSounds/BindableHitSound.ts';
import { ToggleBindable } from './screens/compose/ToggleBindable.ts';
import { EditorScreenType } from './screens/EditorScreenType.ts';

export class EditorDependencies {
  constructor(
    readonly reusablePlayfield: OsuPlayfield,
  ) {
  }

  readonly newCombo = new ToggleBindable(false);
  readonly newComboApplied = new Action<boolean>();
  readonly hitSound = new HitSoundState();
  readonly currentScreen = new Bindable(EditorScreenType.Compose);
}
