import { ComposeToolbarButton } from '../ComposeToolbarButton';
import { Texture } from 'pixi.js';
import {
  Bindable,
  dependencyLoader,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  resolved,
} from 'osucad-framework';
import { EditorSelection } from '../EditorSelection';
import { CommandManager } from '../../../context/CommandManager';
import { NEW_COMBO } from '../../../InjectionTokens';
import { EditorAction } from '../../../EditorAction';

export class NewComboButton
  extends ComposeToolbarButton
  implements IKeyBindingHandler<EditorAction>
{
  constructor(icon: Texture) {
    super(icon);
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  @resolved(NEW_COMBO)
  newCombo!: Bindable<boolean>;

  @dependencyLoader()
  load() {
    this.newCombo.addOnChangeListener(
      () => (this.active = this.newCombo.value),
    );

    this.action = () => (this.newCombo.value = !this.newCombo.value);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === EditorAction.ToggleNewCombo;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === EditorAction.ToggleNewCombo) {
      this.keyPressed = true;
      this.samples.toolSelect.play();
      this.updateState();
    }

    return false;
  }

  onKeyBindingReleased() {
    this.keyPressed = false;
    this.updateState();
  }
}
