import {
  Bindable,
  BindableBoolean, EasingFunction,
  IKeyBindingHandler,
  Key,
  KeyBindingPressEvent,
  KeyDownEvent,
} from 'osucad-framework';
import type { IPositionSnapProvider } from './snapping/IPositionSnapProvider';
import { PositionSnapTarget, SnapTarget } from './snapping/SnapTarget';
import type { ComposeTool } from './tools/ComposeTool';
import type { DrawableComposeTool } from './tools/DrawableComposeTool';
import {
  Axes,
  Container,
  dependencyLoader,
  DrawSizePreservingFillContainer,
  PlatformAction,
  resolved,
  Vec2,
} from 'osucad-framework';
import { HitObjectList } from '../../../beatmap/hitObjects/HitObjectList';
import { DeleteHitObjectCommand } from '../../commands/DeleteHitObjectCommand';
import { UpdateHitObjectCommand } from '../../commands/UpdateHitObjectCommand';
import { CommandManager } from '../../context/CommandManager';
import { HitObjectClipboard } from '../../CopyPasteHandler';
import { EditorAction } from '../../EditorAction';
import { EditorClock } from '../../EditorClock';
import { OsuPlayfield } from '../../hitobjects/OsuPlayfield';
import { Playfield } from '../../hitobjects/Playfield';
import { NEW_COMBO } from '../../InjectionTokens';
import { BeatmapBackground } from '../../playfield/BeatmapBackground';
import { PlayfieldGrid } from '../../playfield/PlayfieldGrid';
import { EditorSelection } from './EditorSelection';
import { HitObjectUtils } from './HitObjectUtils';
import { SelectionOverlay } from './selection/SelectionOverlay';
import { HitObjectSnapProvider } from './snapping/HitObjectSnapProvider';
import { ComposeToolBar } from './ComposeToolBar.ts';
import { ComposeTogglesBar } from './ComposeTogglesBar.ts';
import { GridSnapProvider } from './snapping/GridSnapProvider.ts';
import { Beatmap } from '../../../beatmap/Beatmap.ts';

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

  playfield!: OsuPlayfield;

  gridSnapEnabled = new BindableBoolean(false);

  @dependencyLoader()
  load() {
    this.addAllInternal(this.hitObjectUtils = new HitObjectUtils());

    this.addAllInternal(
      this.#playfieldContainer = new DrawSizePreservingFillContainer({
        targetDrawSize: { x: 512, y: 384 },
        child: new Container({
          width: 512,
          height: 384,
          children: [
            new BeatmapBackground(),
            new PlayfieldGrid(),
            this.playfield = new OsuPlayfield().with({
              clock: this.editorClock,
              processCustomClock: false,
            }),
            new SelectionOverlay(),
            this.#toolContainer,
          ],
        }),
      }),
    );

    this.dependencies.provide(Playfield, this.playfield);
    this.dependencies.provide(OsuPlayfield, this.playfield);

    this.addInternal(new HitObjectClipboard());

    this.snapProviders = [
      new HitObjectSnapProvider(this.hitObjects, this.selection, this.editorClock),
      new GridSnapProvider(this.beatmap.settings.editor.gridSizeBindable, this.gridSnapEnabled,),
    ];

    this.add(this.#toolbarContainer = new Container({
      relativeSizeAxes: Axes.Both,
      padding: { bottom: 10 },
      children: [
        this.#toolBar = new ComposeToolBar(this.activeTool),
        this.#togglesBar = new ComposeTogglesBar().with({ y: 10 }),
      ],
    }));
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  #previousTool!: ComposeTool;

  #playfieldContainer!: DrawSizePreservingFillContainer;

  #toolbarContainer!: Container;

  #toolBar!: ComposeToolBar;

  #togglesBar!: ComposeTogglesBar;

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

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction | EditorAction>): boolean {
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
    ignoreSelected = true,
  ): { offset: Vec2 | null; target: SnapTarget | null; snapTargets: SnapTarget[] } {
    const snapTargets = this.snapProviders.flatMap(it => it.getSnapTargets(ignoreSelected));

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

      if (closest.target.bypassRadius || closestDistance < threshold ** 2)
        return { offset: closest.offset!, target: closest.target, snapTargets };
    }

    return { offset: null, target: null, snapTargets };
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.F5) {
      this.playfield.alpha = this.playfield.alpha === 1 ? 0 : 1;
      return true;
    }

    return false;
  }

  override show() {
    this.#playfieldContainer.moveToY(100).moveToY(0, 500, EasingFunction.OutExpo);
    this.fadeInFromZero(400);

    this.#toolbarContainer.moveToY(-70).moveToY(0, 500, EasingFunction.OutExpo);
    this.#toolBar.moveToX(-100).moveToX(0, 500, EasingFunction.OutExpo);
    this.#togglesBar.moveToX(100).moveToX(0, 500, EasingFunction.OutExpo);
  }

  override hide() {
    this.#playfieldContainer.moveToY(100, 500, EasingFunction.OutExpo);

    this.#toolbarContainer.moveToY(-70, 500, EasingFunction.OutExpo);
    this.#toolBar.moveToX(-100, 500, EasingFunction.OutExpo);
    this.#togglesBar.moveToX(100, 500, EasingFunction.OutExpo);
  }
}
