import type { DragEvent, MouseDownEvent } from 'osucad-framework';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';
import { Axes, clamp, dependencyLoader, MouseButton, resolved } from 'osucad-framework';

import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';
import { ContextMenuContainer } from '../../../../userInterface/ContextMenuContainer';
import { OsucadMenuItem } from '../../../../userInterface/OsucadMenuItem';
import { DiamondKeyframePiece } from '../DiamondKeyframePiece';

export class VolumePointKeyframePiece extends DiamondKeyframePiece {
  override blueprint!: VolumePointSelectionBlueprint;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativePositionAxes = Axes.Y;
    this.width = this.height = 16;

    this.blueprint.volumeBindable.addOnChangeListener(evt => this.#updatePosition(evt.value), { immediate: true });
  }

  #updatePosition(volume: number) {
    this.y = 1 - volume / 100;
  }

  override onDrag(e: DragEvent): boolean {
    if (!super.onDrag(e))
      return false;

    this.blueprint.controlPoint!.volume = clamp(
      100 * (1 - this.parent!.toLocalSpace(e.screenSpaceMousePosition).y / this.parent!.drawHeight),
      5,
      100,
    );

    return true;
  }

  @resolved(ContextMenuContainer)
  contextMenu!: ContextMenuContainer;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.contextMenu.showMenu([
        new OsucadMenuItem({
          text: 'Curve type',
          items: [
            new OsucadMenuItem({
              text: 'Constant',
              action: () => this.setCurveType(VolumeCurveType.Constant),
            }),
            new OsucadMenuItem({
              text: 'Smooth',
              action: () => this.setCurveType(VolumeCurveType.Smooth),
            }),
          ],
        }),
        new OsucadMenuItem({
          text: 'Delete',
          type: 'destructive',
          action: () => this.delete(),
        }),
      ], this);
      return true;
    }

    return super.onMouseDown(e);
  }

  setCurveType(curveType: VolumeCurveType) {
    this.blueprint.curveTypeBindable.value = curveType;
    this.updateHandler.commit();
  }
}
