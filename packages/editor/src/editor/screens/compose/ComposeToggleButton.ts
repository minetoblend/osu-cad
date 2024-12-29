import type { Texture } from 'pixi.js';
import { dependencyLoader, resolved } from 'osucad-framework';
import { CommandManager } from '../../context/CommandManager';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { EditorSelection } from './EditorSelection';

export class ComposeToggleButton extends ComposeToolbarButton {
  constructor(icon: Texture) {
    super(icon);
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  @dependencyLoader()
  [Symbol('load')]() {
    this.action = this.#action.bind(this);
  }

  #action() {
    this.active.toggle();

    if (this.active.value)
      this.onActivate();
    else
      this.onDeactivate();
  }

  protected onActivate() {
  }

  protected onDeactivate() {
  }
}
