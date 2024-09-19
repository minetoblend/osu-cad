import type { BindableBoolean } from 'osucad-framework';
import { dependencyLoader, resolved } from 'osucad-framework';
import { NEW_COMBO } from '../../InjectionTokens';
import { OsucadIcons } from '../../../OsucadIcons';
import { ComposeToggleButton } from './ComposeToggleButton';

export class ComposeComboToggleButton extends ComposeToggleButton {
  constructor() {
    super(OsucadIcons.get('new-combo'));
  }

  newCombo = new BindableBoolean();

  @resolved(NEW_COMBO_APPLIED)
  newComboApplied!: Action<boolean>;

  @dependencyLoader()
  load() {
    this.newCombo.bindTo(this.dependencies.resolve(NEW_COMBO));

    this.active.bindTo(this.newCombo);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding instanceof EditorAction;
  }

  onKeyBindingPressed(event: KeyBindingPressEvent<EditorAction>) {
    if (event.pressed === EditorAction.ToggleNewCombo) {
      this.armed = true;
      this.triggerAction();
      return true;
    }

    return false;
  }

  onKeyBindingReleased(event: KeyBindingReleaseEvent<EditorAction>) {
    if (event.pressed === EditorAction.ToggleNewCombo) {
      this.armed = false;
    }
  }

  protected onActivate() {
    super.onActivate();

    this.newComboApplied.emit(true);
  }

  protected onDeactivate() {
    super.onDeactivate();

    this.newComboApplied.emit(false);
  }
}
