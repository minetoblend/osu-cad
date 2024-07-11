import { ComposeToolbarButton } from './ComposeToolbarButton';
import { Texture } from 'pixi.js';
import {
  Bindable,
  dependencyLoader,
  IKeyBindingHandler,
  InjectionToken,
  KeyBindingPressEvent,
  resolved,
} from 'osucad-framework';
import { EditorSelection } from './EditorSelection';
import { CommandManager } from '../../context/CommandManager';
import { EditorAction } from '../../EditorAction';

export class ComposeToggleButton
  extends ComposeToolbarButton
  implements IKeyBindingHandler<EditorAction>
{
  constructor(
    icon: Texture,
    readonly key: InjectionToken<Bindable<boolean>>,
    readonly toggleAction?: EditorAction,
  ) {
    super(icon);
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  #isActive!: Bindable<boolean>;

  @dependencyLoader()
  load() {
    this.#isActive = this.dependencies.resolve(this.key);

    this.#isActive.addOnChangeListener((value) => (this.active = value), {
      immediate: true,
    });

    this.action = () => (this.#isActive.value = !this.#isActive.value);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === this.toggleAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.toggleAction) {
      this.keyPressed = true;
      this.samples.toolSelect.play();
      this.#isActive.value = !this.#isActive.value;
      this.updateState();
    }

    return false;
  }

  onKeyBindingReleased() {
    this.keyPressed = false;
    this.updateState();
  }
}
