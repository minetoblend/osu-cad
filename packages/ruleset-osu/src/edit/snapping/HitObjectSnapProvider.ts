import type { ComposeToolContainer, HitObject } from '@osucad/common';
import type { Vec2 } from 'osucad-framework';
import type { IPositionSnapProvider } from '../IPositionSnapProvider';
import type { OsuSelectionBlueprint } from '../selection/OsuSelectionBlueprint';
import type { OsuSelectionBlueprintContainer } from '../selection/OsuSelectionBlueprintContainer';
import { DrawableHitObjectPlacementTool } from '@osucad/common';
import { SnapResult } from '../IPositionSnapProvider';

export class HitObjectSnapProvider implements IPositionSnapProvider {
  constructor(
    readonly blueprintContainer: OsuSelectionBlueprintContainer,
    readonly toolContainer: ComposeToolContainer,
  ) {
  }

  snapPosition(position: Vec2): SnapResult | null {
    const blueprints = [...this.blueprintContainer.allObjects] as OsuSelectionBlueprint[];

    const threshold = 5;

    let activeHitObject: HitObject | null = null;

    const drawableTool = this.toolContainer.activeDrawableTool;
    if (drawableTool instanceof DrawableHitObjectPlacementTool)
      activeHitObject = drawableTool.hitObject;

    for (const blueprint of blueprints) {
      if (blueprint.selected.value)
        continue;

      if (blueprint.hitObject!.transient || blueprint.hitObject === activeHitObject)
        continue;

      for (const snapPosition of blueprint.snapPositions) {
        if (position.distance(snapPosition) < threshold)
          return new SnapResult(position, snapPosition);
      }
    }

    return null;
  }
}
