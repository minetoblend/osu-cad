import {
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  PlatformAction,
  resolved,
  Vec2,
} from 'osucad-framework';
import type { ToolConstructor } from './ComposeScreen';
import { SelectionOverlay } from './SelectionOverlay';
import { EditorSelection } from './EditorSelection';
import { CommandManager } from '../../context/CommandManager';
import {
  DeleteHitObjectCommand,
  Slider,
  UpdateHitObjectCommand,
} from '@osucad/common';
import { EditorAction } from '../../EditorAction';
import { NEW_COMBO } from '../../InjectionTokens';
import { HitObjectUtils } from './HitObjectUtils';
import { EditorClock } from '../../EditorClock';
import { ConnectedUsersManager } from '../../context/ConnectedUsersManager';
import { ComposerCursorContainer } from './ComposerCursorContainer';

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

    const userManager = this.dependencies.resolveOptional(
      ConnectedUsersManager,
    );

    if (userManager) {
      this.addInternal(new ComposerCursorContainer());
    }
  }

  protected loadComplete() {
    super.loadComplete();

    this.withScope(() => {
      this.activeTool.addOnChangeListener(
        (tool) => {
          if (
            this.#toolContainer.children.length === 0 ||
            !(this.#toolContainer.child instanceof tool)
          ) {
            this.#toolContainer.child = new tool();
            this.#toolContainer.updateSubTree();
          }
        },
        { immediate: true },
      );
    });
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
      case EditorAction.NudgeForward:
        this.#nudgeTiming(1);
        return true;
      case EditorAction.NudgeBackward:
        this.#nudgeTiming(-1);
        return true;
      case EditorAction.FlipHorizontal:
        this.hitObjectUtils.mirrorHitObjects(
          Axes.X,
          this.selection.selectedObjects,
          false,
        );
        return true;
      case EditorAction.FlipVertical:
        this.hitObjectUtils.mirrorHitObjects(
          Axes.Y,
          this.selection.selectedObjects,
          false,
        );
        return true;
      case EditorAction.RotateCW:
        this.hitObjectUtils.rotateHitObjects(
          this.selection.selectedObjects,
          new Vec2(512 / 2, 384 / 2),
          Math.PI / 2,
          true,
        );
        return true;
      case EditorAction.RotateCCW:
        this.hitObjectUtils.rotateHitObjects(
          this.selection.selectedObjects,
          new Vec2(512 / 2, 384 / 2),
          -Math.PI / 2,
          true,
        );
        return true;
      case EditorAction.Reverse:
        this.hitObjectUtils.reverseObjects(
          this.selection.selectedObjects,
          true,
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

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #nudgeTiming(direction: number) {
    const beatLength = this.editorClock.beatLength;
    const divisor = this.editorClock.beatSnapDivisor.value;

    for (const object of this.selection.selectedObjects) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(object, {
          startTime: object.startTime + (direction * beatLength) / divisor,
        }),
        false,
      );
    }

    this.commandManager.commit();
  }
}
