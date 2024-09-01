import type { BindableBoolean } from 'osucad-framework';
import { dependencyLoader, resolved } from 'osucad-framework';
import { NEW_COMBO } from '../../InjectionTokens';
import { OsucadIcons } from '../../../OsucadIcons';
import { ComposeToggleButton } from './ComposeToggleButton';

export class ComposeComboToggleButton extends ComposeToggleButton {
  constructor() {
    super(OsucadIcons.get('new-combo'));
  }

  @resolved(NEW_COMBO)
  newCombo!: BindableBoolean;

  @dependencyLoader()
  load() {
    this.active.bindTo(this.newCombo);
  }
}
