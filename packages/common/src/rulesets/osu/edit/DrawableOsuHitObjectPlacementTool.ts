import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { clamp, resolved, Vec2 } from 'osucad-framework';
import { DrawableHitObjectPlacementTool } from '../../../editor/screens/compose/DrawableHitObjectPlacementTool';
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
    let position = this.mousePosition;

    const snapResult = this.snapProvider.snapPosition(this.mousePosition);

    if (snapResult) {
      position = snapResult.position;
    }

    return this.clampToBounds(position);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }
}
