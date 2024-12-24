import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { SnapResult } from './IPositionSnapProvider';
import { Anchor, Axes, BindableBoolean, dependencyLoader, Direction, FillDirection, FillFlowContainer, provide, resolved, Vec2 } from 'osucad-framework';
import { Matrix } from 'pixi.js';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { EditorClock } from '../../../editor/EditorClock';
import { HitObjectComposer } from '../../../editor/screens/compose/HitObjectComposer';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';
import { HitCirclePlacementTool } from './HitCirclePlacementTool';
import { IDistanceSnapProvider } from './IDistanceSnapProvider';
import { IPositionSnapProvider } from './IPositionSnapProvider';
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

  @dependencyLoader()
  [Symbol('load')]() {
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
  }

  #grid!: PlayfieldGrid;

  #blueprintContainer!: OsuSelectionBlueprintContainer;

  #positionSnapProviders!: IPositionSnapProvider[];

  snapPosition(position: Vec2): SnapResult | null {
    for (const snapProvider of this.#positionSnapProviders) {
      const result = snapProvider.snapPosition(position);
      if (result)
        return result;
    }

    return null;
  }

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  findSnappedDistance(referenceObject: Slider): number {
    const length = referenceObject!.path.calculatedDistance;
    const duration = Math.ceil(length / referenceObject!.sliderVelocity);
    let time = this.controlPointInfo.snap(
      // adding a tiny bit of length to make up for precision errors shortening the slider
      Math.ceil(referenceObject!.startTime + duration) + 1,
      this.editorClock.beatSnapDivisor.value,
      false,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(referenceObject.startTime).beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return Math.max(0, referenceObject!.sliderVelocity * (time - referenceObject!.startTime));
  }

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
      hitObject.expectedDistance = this.findSnappedDistance(hitObject);
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
