import {
  dependencyLoader,
  IKeyBindingHandler,
  InjectionToken,
  KeyBindingPressEvent,
  resolved,
} from 'osucad-framework';
import { Texture } from 'pixi.js';
import { CommandManager } from '../../context/CommandManager';
import { EditorAction } from '../../EditorAction';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { EditorSelection } from './EditorSelection';
import { ToggleBindable } from './ToggleBindable';

export class ComposeToggleButton
  extends ComposeToolbarButton
  implements IKeyBindingHandler<EditorAction>
{
  constructor(
    icon: Texture,
    readonly key: InjectionToken<ToggleBindable>,
    readonly toggleAction?: EditorAction,
  ) {
    super(icon);
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  #isActive!: ToggleBindable;

  @dependencyLoader()
  load() {
    this.#isActive = this.dependencies.resolve(this.key);

    this.#isActive.addOnChangeListener((value) => (this.active = value), {
      immediate: true,
    });

    this.action = () => {
      try {
        this.#isActive.buttonPressed = true;
        this.#isActive.toggle();
      } finally {
        this.#isActive.buttonPressed = false;
      }
    };
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding === this.toggleAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.toggleAction) {
      this.keyPressed = true;
      this.samples.toolSelect.play();
      this.action?.();
      this.updateState();
    }

    return false;
  }

  onKeyBindingReleased() {
    this.keyPressed = false;
    this.updateState();
  }
}
