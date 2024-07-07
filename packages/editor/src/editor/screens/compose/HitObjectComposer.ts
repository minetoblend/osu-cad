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
import { NEW_COMBO } from '../../InjectionTokens';
import { HitObjectUtils } from './HitObjectUtils';

export class HitObjectComposer
  extends Container
  implements IKeyBindingHandler<PlatformAction | EditorAction>
{
  constructor(protected readonly activeTool: Bindable<ToolConstructor>) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  hitObjectUtils!: HitObjectUtils;

  #toolContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  @dependencyLoader()
  load() {
    this.addInternal(new SelectionOverlay());

    this.addInternal(this.#toolContainer);

    this.addInternal((this.hitObjectUtils = new HitObjectUtils()));

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
      case EditorAction.FlipHorizontal:
        this.hitObjectUtils.mirrorHitObjects(
          Axes.X,
          this.selection.selectedObjects,
        );
        return true;
      case EditorAction.FlipVertical:
        this.hitObjectUtils.mirrorHitObjects(
          Axes.Y,
          this.selection.selectedObjects,
        );
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

  @resolved(NEW_COMBO)
  newCombo!: Bindable<boolean>;

  #toggleNewCombo() {
    this.newCombo.value = !this.newCombo.value;
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
