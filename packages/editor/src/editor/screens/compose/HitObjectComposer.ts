import type {
  Bindable,
  IKeyBindingHandler,
  KeyBindingPressEvent,
} from 'osucad-framework';
import {
  Axes,
  Container,
  PlatformAction,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import {
  DeleteHitObjectCommand,
  HitObjectManager,
  UpdateHitObjectCommand,
} from '@osucad/common';
import { CommandManager } from '../../context/CommandManager';
import { EditorAction } from '../../EditorAction';
import { NEW_COMBO } from '../../InjectionTokens';
import { EditorClock } from '../../EditorClock';
import { ConnectedUsersManager } from '../../context/ConnectedUsersManager';
import { HitObjectClipboard } from '../../CopyPasteHandler';
import { HitObjectUtils } from './HitObjectUtils';
import { EditorSelection } from './EditorSelection';
import { SelectionOverlay } from './SelectionOverlay';
import { ComposerCursorContainer } from './ComposerCursorContainer';
import type { IPositionSnapProvider } from './snapping/IPositionSnapProvider';
import { HitObjectSnapProvider } from './snapping/HitObjectSnapProvider';
import type { SnapTarget } from './snapping/SnapTarget';
import type { ComposeTool } from './tools/ComposeTool';
import type { DrawableComposeTool } from './tools/DrawableComposeTool';

export class HitObjectComposer
  extends Container
  implements IKeyBindingHandler<PlatformAction | EditorAction> {
  constructor(protected readonly activeTool: Bindable<ComposeTool>) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  hitObjectUtils!: HitObjectUtils;

  #toolContainer = new Container<DrawableComposeTool>({
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

    this.addInternal(new HitObjectClipboard());

    if (userManager) {
      this.addInternal(new ComposerCursorContainer());
    }

    this.snapProviders = [
      new HitObjectSnapProvider(this.hitObjects, this.selection, this.editorClock),
    ];
  }

  #previousTool!: ComposeTool;

  protected loadComplete() {
    super.loadComplete();

    this.withScope(() => {
      this.activeTool.addOnChangeListener(
        ({ value: tool }) => {
          if (
            this.#toolContainer.children.length === 0
            || !(tool.isSameTool(this.#previousTool))
          ) {
            this.#toolContainer.child = tool.createDrawableTool();
            this.#previousTool = tool;
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

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

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

  snapProviders!: IPositionSnapProvider[];

  snapHitObjectPosition(
    positions: Vec2[],
    threshold = 5,
  ): { offset: Vec2 | null; target: SnapTarget | null; snapTargets: SnapTarget[] } {
    const snapTargets = this.snapProviders.flatMap(it => it.getSnapTargets());

    const offsets = snapTargets.map((it) => {
      return {
        target: it,
        offset: it.getSnapOffset(positions),
      };
    }).filter(it => it.offset !== null);

    if (offsets.length > 0) {
      let closest = offsets[0];
      let closestDistance = closest.offset!.lengthSq();

      for (let i = 1; i < offsets.length; i++) {
        const distance = offsets[i].offset!.lengthSq();

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = offsets[i];
        }
      }

      if (closestDistance < threshold ** 2)
        return { offset: closest.offset!, target: closest.target, snapTargets };
    }

    return { offset: null, target: null, snapTargets };
  }
}
