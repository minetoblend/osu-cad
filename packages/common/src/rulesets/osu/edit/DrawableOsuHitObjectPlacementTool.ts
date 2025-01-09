import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { clamp, resolved, Vec2 } from 'osucad-framework';
import { DrawableHitObjectPlacementTool } from '../../../editor/screens/compose/DrawableHitObjectPlacementTool';
import { PathType } from '../hitObjects/PathType';
import { IDistanceSnapProvider } from './IDistanceSnapProvider';
import { IPositionSnapProvider } from './IPositionSnapProvider';

export abstract class DrawableOsuHitObjectPlacementTool<T extends OsuHitObject> extends DrawableHitObjectPlacementTool<T> {
  @resolved(IPositionSnapProvider)
  snapProvider!: IPositionSnapProvider;

  clampToBounds(position: Vec2) {
    return new Vec2(
      clamp(position.x, 0, 512),
      clamp(position.y, 0, 384),
    );
  }

  get snappedMousePosition() {
    return this.snapPosition(this.mousePosition);
  }

  protected snapPosition(position: Vec2, clampToBounds: boolean = true) {
    const snapResult = this.snapProvider.snapPosition(position);

    if (snapResult)
      position = snapResult.position;

    if (clampToBounds)
      position = this.clampToBounds(position);

    return position;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.receiveInputEverywhere || super.receivePositionalInputAt(screenSpacePosition);
  }

  protected get receiveInputEverywhere() {
    return true;
  }

  @resolved(IDistanceSnapProvider)
  distanceSnapProvider!: IDistanceSnapProvider;

  getNextControlPointType(
    currentType: PathType | null,
    index: number,
  ): PathType | null {
    let newType: PathType | null = null;

    switch (currentType) {
      case null:
        newType = PathType.Bezier;
        break;
      case PathType.Bezier:
        newType = PathType.PerfectCurve;
        break;
      case PathType.PerfectCurve:
        newType = PathType.Linear;
        break;
      case PathType.Linear:
        newType = PathType.Catmull;
        break;
      case PathType.Catmull:
        newType = null;
        break;
    }

    if (index === 0 && newType === null) {
      newType = PathType.Bezier;
    }

    return newType;
  }
}
