import type {
  Action,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyBindingReleaseEvent,
} from 'osucad-framework';
import {
  BindableBoolean,
  dependencyLoader,
} from 'osucad-framework';
import { OsucadIcons } from '../../../OsucadIcons';
import { EditorAction } from '../../EditorAction';
import { EditorDependencies } from '../../EditorDependencies';
import { ComposeToggleButton } from './ComposeToggleButton';

export class ComposeComboToggleButton extends ComposeToggleButton implements IKeyBindingHandler<EditorAction> {
  constructor() {
    super(OsucadIcons.get('new-combo'));
  }

  newCombo = new BindableBoolean();

  newComboApplied!: Action<boolean>;

  @dependencyLoader()
  load() {
    const { newCombo, newComboApplied } = this.dependencies.resolve(EditorDependencies);

    this.newCombo.bindTo(newCombo);
    this.newComboApplied = newComboApplied;

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
