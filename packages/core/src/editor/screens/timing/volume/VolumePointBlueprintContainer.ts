import type { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import type { ControlPointList } from '../../../../controlPoints/ControlPointList';
import type { VolumePoint } from '../../../../controlPoints/VolumePoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import { Axes, dependencyLoader, DrawablePool } from '@osucad/framework';
import { ControlPointBlueprintContainer } from '../../../ui/timeline/ControlPointBlueprintContainer';
import { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';

export class VolumePointBlueprintContainer extends ControlPointBlueprintContainer<VolumePoint, VolumePointSelectionBlueprint> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #pool = new DrawablePool(VolumePointSelectionBlueprint, 10, 20);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#pool);
  }

  protected override getControlPointList(controlPoints: ControlPointInfo): ControlPointList<VolumePoint> {
    return controlPoints.volumePoints;
  }

  override getDrawable(entry: ControlPointLifetimeEntry<VolumePoint>): VolumePointSelectionBlueprint {
    return this.#pool.get(drawable => drawable.entry = entry);
  }
}
