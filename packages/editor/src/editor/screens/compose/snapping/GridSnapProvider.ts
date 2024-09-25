import { almostEquals, Bindable, Vec2 } from 'osucad-framework';
import { IPositionSnapProvider } from './IPositionSnapProvider';
import { SnapTarget } from './SnapTarget';

export class GridSnapProvider implements IPositionSnapProvider {
  constructor(
    private readonly gridSize: Bindable<number>,
    private readonly enabled: Bindable<boolean>,
  ) {
  }

  getSnapTargets(): SnapTarget[] {
    if (!this.enabled.value || almostEquals(this.gridSize.value, 0))
      return [];

    return [new GridSnapTarget(this.gridSize.value)];
  }
}

class GridSnapTarget extends SnapTarget {
  constructor(
    readonly gridSize: number,
  ) {
    super();
  }

  getSnapOffset(positions: Vec2[]): Vec2 | null {
    let closest: Vec2 | null = null;
    let closestDistance = Number.MAX_VALUE;

    for (const p of positions) {
      const x = Math.round(p.x / this.gridSize) * this.gridSize;
      const y = Math.round(p.y / this.gridSize) * this.gridSize;

      const distance = Vec2.distanceSq(p, new Vec2(x, y));
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = new Vec2(x - p.x, y - p.y);
      }
    }

    return closest;
  }

  override get bypassRadius(): boolean {
    return true;
  }
}
