import {
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  PlatformAction,
  resolved,
} from 'osucad-framework';
import type { ToolConstructor } from './ComposeScreen';
import { SelectionOverlay } from './SelectionOverlay';
import { EditorSelection } from './EditorSelection';
import { CommandManager } from '../../context/CommandManager';
import { DeleteHitObjectCommand } from '@osucad/common';

export class HitObjectComposer
  extends Container
  implements IKeyBindingHandler<PlatformAction>
{
  constructor(protected readonly activeTool: Bindable<ToolConstructor>) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #toolContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  @dependencyLoader()
  load() {
    this.addInternal(new SelectionOverlay());

    this.addInternal(this.#toolContainer);

    this.activeTool.addOnChangeListener(
      (tool) => {
        if (
          this.#toolContainer.children.length === 0 ||
          !(this.#toolContainer.child instanceof tool)
        ) {
          this.#toolContainer.child = new tool();
        }
      },
      { immediate: true },
    );
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.Delete:
        for (const object of this.selection.selectedObjects) {
          this.commandManager.submit(new DeleteHitObjectCommand(object), false);
        }
        this.commandManager.commit();
        return true;
    }

    return false;
  }
}
