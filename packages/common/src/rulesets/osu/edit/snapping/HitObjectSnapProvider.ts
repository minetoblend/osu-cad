import type { Vec2 } from 'osucad-framework';
import type { IPositionSnapProvider } from '../IPositionSnapProvider';
import type { OsuSelectionBlueprint } from '../selection/OsuSelectionBlueprint';
import type { OsuSelectionBlueprintContainer } from '../selection/OsuSelectionBlueprintContainer';
import { SnapResult } from '../IPositionSnapProvider';

export class HitObjectSnapProvider implements IPositionSnapProvider {
  constructor(
    readonly blueprintContainer: OsuSelectionBlueprintContainer,
  ) {
  }

  snapPosition(position: Vec2): SnapResult | null {
    const blueprints = [...this.blueprintContainer.allObjects] as OsuSelectionBlueprint[];

    const threshold = 5;

    for (const blueprint of blueprints) {
      if (blueprint.selected.value)
        continue;

      if (blueprint.hitObject!.synthetic)
        continue;

      for (const snapPosition of blueprint.snapPositions) {
        if (position.distance(snapPosition) < threshold)
          return new SnapResult(position, snapPosition);
      }
    }

    return null;
  }
}
