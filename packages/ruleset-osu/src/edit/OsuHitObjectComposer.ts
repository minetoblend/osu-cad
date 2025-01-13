import type { HitObject, IComposeTool } from '@osucad/common';
import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { SnapResult } from './IPositionSnapProvider';
import { Additions, ControlPointInfo, EditorClock, HitObjectComposer, OsucadColors } from '@osucad/common';
import { Anchor, Axes, BindableBoolean, Container, Direction, FastRoundedBox, FillDirection, FillFlowContainer, provide, resolved, Vec2 } from 'osucad-framework';
import { Matrix } from 'pixi.js';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';
import { AdditionToggleButton } from './AdditionToggleButton';
import { DrawableOsuSelectTool } from './DrawableOsuSelectTool';
import { GlobalHitSoundState } from './GlobalHitSoundState';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { HitCirclePlacementTool } from './HitCirclePlacementTool';
import { HitSoundPlayer } from './HitSoundPlayer';
import { IDistanceSnapProvider } from './IDistanceSnapProvider';
import { IPositionSnapProvider } from './IPositionSnapProvider';
import { NewComboToggleButton } from './NewComboToggleButton';
import { OsuSelectionManager } from './OsuSelectionManager';
import { OsuSelectTool } from './OsuSelectTool';
import { PlayfieldGrid } from './PlayfieldGrid';
import { OsuSelectionBlueprintContainer } from './selection/OsuSelectionBlueprintContainer';
import { SliderPlacementTool } from './SliderPlacementTool';
import { GridSnapToggleButton } from './snapping/GridSnapToggleButton';
import { HitObjectSnapProvider } from './snapping/HitObjectSnapProvider';

@provide(IPositionSnapProvider)
@provide(IDistanceSnapProvider)
@provide(OsuHitObjectComposer)
export class OsuHitObjectComposer extends HitObjectComposer implements IPositionSnapProvider {
  protected override getTools(): IComposeTool[] {
    return [
      new OsuSelectTool(),
      new HitCirclePlacementTool(),
      new SliderPlacementTool(),
    ];
  }

  readonly gridSnapEnabled = new BindableBoolean(false);

  @provide()
  readonly newCombo = new GlobalNewComboBindable();

  @provide()
  readonly hitSoundState = new GlobalHitSoundState();

  @provide()
  protected readonly hitSoundPlayer = new HitSoundPlayer();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.hitSoundPlayer);

    this.drawableRuleset.playfield.addAll(this.#grid = new PlayfieldGrid(this.gridSnapEnabled).with({ depth: 1 }));
    this.overlayLayer.addAll(
      this.#blueprintContainer = new OsuSelectionBlueprintContainer().with({ depth: 1 }),
    );

    this.leftSidebar.add(
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        direction: FillDirection.Vertical,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        children: [
          new GridSnapToggleButton(this.gridSnapEnabled),
        ],
      }),
    );

    this.#positionSnapProviders = [
      new HitObjectSnapProvider(
        this.#blueprintContainer,
        this.toolContainer,
      ),
      this.#grid,
    ];

    this.toolContainer.toolActivated.addListener(tool =>
      this.#blueprintContainer.alpha = (tool instanceof DrawableOsuSelectTool) ? 1 : 0,
    );
  }

  #grid!: PlayfieldGrid;

  #blueprintContainer!: OsuSelectionBlueprintContainer;

  #positionSnapProviders!: IPositionSnapProvider[];

  protected override createRightSidebar(): Container {
    return new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.Y,
      autoSizeAxes: Axes.X,
      padding: 10,
      spacing: new Vec2(4),
      children: [
        new NewComboToggleButton(),
        new Container({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          padding: { vertical: 4, horizontal: 6 },
          child: new FastRoundedBox({
            relativeSizeAxes: Axes.X,
            height: 2,
            cornerRadius: 1,
            color: OsucadColors.translucent,
            alpha: 0.4,
          }),
        }),
        new AdditionToggleButton(Additions.Whistle, this.hitSoundState.whistle),
        new AdditionToggleButton(Additions.Finish, this.hitSoundState.finish),
        new AdditionToggleButton(Additions.Clap, this.hitSoundState.clap),
      ],
    });
  }

  snapPosition(position: Vec2): SnapResult | null {
    for (const snapProvider of this.#positionSnapProviders) {
      const result = snapProvider.snapPosition(position);
      if (result)
        return result;
    }

    return null;
  }

  protected override createSelectionManager() {
    return new OsuSelectionManager();
  }

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  transformHitObject(hitObject: HitObject, transform: Matrix) {
    if (!(hitObject instanceof HitCircle || hitObject instanceof Slider))
      return;

    const position = hitObject.position;
    hitObject.position = Vec2.from(transform.apply(position));

    if (hitObject instanceof Slider) {
      const pointTransform = transform
        .clone()
        .translate(-transform.tx, -transform.ty);

      hitObject.controlPoints = hitObject.path.controlPoints.map(p => p.transformBy(pointTransform));
      hitObject.snapLength(this.controlPointInfo, this.editorClock.beatSnapDivisor.value);
    }
  }

  mirrorHitObjects(hitObjects: HitObject[], direction: Direction) {
    const matrix = new Matrix()
      .translate(-512 / 2, -384 / 2)
      .scale(
        direction === Direction.Horizontal ? -1 : 1,
        direction === Direction.Vertical ? -1 : 1,
      )
      .translate(512 / 2, 384 / 2);

    for (const hitObject of hitObjects)
      this.transformHitObject(hitObject, matrix);
  }
}
