import type { HitObject, HitObjectList } from '@osucad/common';
import type { EditorClock } from '../../../EditorClock';
import type { EditorSelection } from '../EditorSelection';
import type { IPositionSnapProvider } from './IPositionSnapProvider';
import { PathApproximator, PathType, Slider, Spinner } from '@osucad/common';
import { Vec2 } from 'osucad-framework';
import { PositionSnapTarget } from './SnapTarget';

export class HitObjectSnapProvider implements IPositionSnapProvider {
  constructor(
    private readonly hitObjects: HitObjectList,
    private readonly selection: EditorSelection,
    private readonly clock: EditorClock,
  ) {}

  getSnapTargets(ignoreSelected: boolean) {
    const currentTime = this.clock.currentTime;

    const hitObjects = this.hitObjects.filter(it => (!ignoreSelected || !this.selection.isSelected(it)) && it.isVisibleAtTime(currentTime));

    const positions = hitObjects.flatMap((it) => {
      if (it instanceof Spinner || it.synthetic)
        return [];

      if (it instanceof Slider)
        return [it.position, it.position.add(it.path.endPosition)];

      return [it.position];
    });

    const snapTargets = positions.map(pos => new PositionSnapTarget(pos));

    snapTargets.push(...this.#getBlanketSnapTargets(hitObjects));

    return snapTargets;
  }

  #getBlanketSnapTargets(hitObjects: HitObject[]): PositionSnapTarget[] {
    const snapTargets: PositionSnapTarget[] = [];

    for (const h of hitObjects) {
      if (!(h instanceof Slider))
        continue;

      const path = h.path.controlPoints;
      for (let i = 0; i < path.length; i++) {
        if (
          path[i].type === PathType.PerfectCurve
          && path[i + 1]?.type === null
          && path[i + 2]?.type === null
          && (!path[i + 3] || path[i + 3].type !== null)
        ) {
          const arcProperties = PathApproximator._circularArcProperties([
            new Vec2(path[i].x, path[i].y),
            new Vec2(path[i + 1].x, path[i + 1].y),
            new Vec2(path[i + 2].x, path[i + 2].y),
          ]);
          if (arcProperties.isValid) {
            snapTargets.push(new PositionSnapTarget(arcProperties.centre.add(h.stackedPosition)));
          }
        }
      }
    }

    return snapTargets;
  }
}
