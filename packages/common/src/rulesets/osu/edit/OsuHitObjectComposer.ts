import type { Vec2 } from 'osucad-framework';
import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import type { SnapResult } from './IPositionSnapProvider';
import { Anchor, Axes, BindableBoolean, dependencyLoader, FillDirection, FillFlowContainer, provide } from 'osucad-framework';
import { HitObjectComposer } from '../../../editor/screens/compose/HitObjectComposer';
import { HitCirclePlacementTool } from './HitCirclePlacementTool';
import { IPositionSnapProvider } from './IPositionSnapProvider';
import { OsuSelectTool } from './OsuSelectTool';
import { PlayfieldGrid } from './PlayfieldGrid';
import { OsuSelectionBlueprintContainer } from './selection/OsuSelectionBlueprintContainer';
import { SliderPlacementTool } from './SliderPlacementTool';
import { GridSnapToggleButton } from './snapping/GridSnapToggleButton';
import { HitObjectSnapProvider } from './snapping/HitObjectSnapProvider';

@provide(IPositionSnapProvider)
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
      new HitObjectSnapProvider(this.#blueprintContainer),
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
}
