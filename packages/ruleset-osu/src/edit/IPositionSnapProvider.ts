import type { Vec2 } from '@osucad/framework';

export interface IPositionSnapProvider {
  snapPosition(position: Vec2): SnapResult | null;
}

export class SnapResult {
  constructor(
    readonly referencePosition: Vec2,
    readonly position: Vec2,
    readonly time?: number,
  ) {
  }

  get snapOffset() {
    return this.position.sub(this.referencePosition);
  }

  get snapDistance() {
    return this.position.distance(this.referencePosition);
  }
}

// eslint-disable-next-line ts/no-redeclare
export const IPositionSnapProvider = {
  findClosestSnapResult(
    snapProvider: IPositionSnapProvider,
    positions: Vec2[],
  ) {
    let closest: SnapResult | null = null;
    let closestDistance = Number.MAX_VALUE;

    for (const position of positions) {
      const result = snapProvider.snapPosition(position);
      if (result && result.snapDistance < closestDistance) {
        closest = result;
        closestDistance = result.snapDistance;
      }
    }

    return closest;
  },
};
