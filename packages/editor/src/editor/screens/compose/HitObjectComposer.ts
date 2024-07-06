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
import { DeleteHitObjectCommand, UpdateHitObjectCommand } from '@osucad/common';
import { EditorAction } from '../../EditorAction';

export class HitObjectComposer
  extends Container
  implements IKeyBindingHandler<PlatformAction | EditorAction>
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

  canHandleKeyBinding(binding: PlatformAction | EditorAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.Delete:
        this.#deleteSelection();
        return true;
      case EditorAction.ToggleNewCombo:
        this.#toggleNewCombo();
        return true;
      case EditorAction.NudgeUp:
        this.#nudgePosition(0, -1);
        return true;
      case EditorAction.NudgeDown:
        this.#nudgePosition(0, 1);
        return true;
      case EditorAction.NudgeLeft:
        this.#nudgePosition(-1, 0);
        return true;
      case EditorAction.NudgeRight:
        this.#nudgePosition(1, 0);
        return true;
    }

    return false;
  }

  #deleteSelection() {
    for (const object of this.selection.selectedObjects) {
      this.commandManager.submit(new DeleteHitObjectCommand(object), false);
    }
    this.commandManager.commit();
  }

  #toggleNewCombo() {
    const objects = this.selection.selectedObjects;
    if (objects.length === 0) return;

    if (objects.every((it) => it.isNewCombo)) {
      for (const object of objects) {
        this.commandManager.submit(
          new UpdateHitObjectCommand(object, {
            newCombo: false,
          }),
          false,
        );
      }
    } else {
      for (const object of objects) {
        this.commandManager.submit(
          new UpdateHitObjectCommand(object, {
            newCombo: true,
          }),
          false,
        );
      }
    }

    this.commandManager.commit();
  }

  #nudgePosition(dx: number, dy: number) {
    for (const object of this.selection.selectedObjects) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(object, {
          position: object.position.add({ x: dx, y: dy }),
        }),
        false,
      );
    }

    this.commandManager.commit();
  }
}
